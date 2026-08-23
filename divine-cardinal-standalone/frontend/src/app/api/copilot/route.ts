import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query, storeContext } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 });
    }

    const systemPrompt = `You are the Kalvix Nexus AI Co-pilot, a highly intelligent Store Manager Assistant.
Your job is to answer the store owner's questions accurately based on the current store context provided below.
Provide concise, helpful, and professional answers. Do not make up data outside the provided context, but you can do calculations based on it.

STORE CONTEXT:
${storeContext}
`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.2,
        max_tokens: 256
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      throw new Error(`Groq API error: ${errText}`);
    }

    const groqData = await groqRes.json();
    const reply = groqData.choices[0].message.content;

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Copilot API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
