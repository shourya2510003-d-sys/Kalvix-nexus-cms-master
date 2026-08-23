import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. Fetch the HTML content
    let html = '';
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      html = await response.text();
    } catch (fetchError: any) {
      return NextResponse.json({ error: `Failed to fetch URL: ${fetchError.message}` }, { status: 500 });
    }

    // 2. Extract SEO elements using basic regex (since cheerio is not installed)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) || 
                          html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : '';

    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';
    
    // Count word length roughly (stripping scripts, styles, and tags)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let wordCount = 0;
    if (bodyMatch) {
      const cleanText = bodyMatch[1]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      wordCount = cleanText.split(' ').length;
    }

    // 3. Send data to Groq API for Audit
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 });
    }

    const prompt = `You are an expert SEO Analyst for an Ayurvedic eCommerce store. 
Please audit the following webpage data and provide a JSON response evaluating it against modern SEO algorithms.

Page URL: ${url}
Title Tag: ${title || '[Missing]'} (Length: ${title.length} chars)
Meta Description: ${metaDescription || '[Missing]'} (Length: ${metaDescription.length} chars)
H1 Header: ${h1 || '[Missing]'}
Approximate Word Count: ${wordCount} words

Provide your analysis in the following strict JSON format (do not include markdown blocks or any other text):
{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      throw new Error(`Groq API error: ${errText}`);
    }

    const groqData = await groqRes.json();
    const auditResult = JSON.parse(groqData.choices[0].message.content);

    return NextResponse.json({
      url,
      scrapedData: { title, metaDescription, h1, wordCount },
      auditResult
    });

  } catch (error: any) {
    console.error("SEO Audit Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
