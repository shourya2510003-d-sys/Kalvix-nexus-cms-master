import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { messages, systemPrompt } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ 
        role: 'assistant', 
        content: 'Groq API Key is missing. Please configure GROQ_API_KEY in environment variables.' 
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    let productsContext = "No specific products found.";
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kalvix-nexus-production.up.railway.app/api';
      const res = await fetch(`${API_URL}/products?limit=20`);
      if (res.ok) {
        const data = await res.json();
        const arr = data.products || data.data || data;
        if (Array.isArray(arr) && arr.length > 0) {
          const productList = arr.filter((p: any) => p.status?.toLowerCase() === 'active').map((p: any) => `- ${p.name}: ${p.summary || p.description} (Rs. ${p.price || p.basePrice})`).join('\n');
          productsContext = `Available Products in Store:\n${productList}`;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch products for RAG', e);
    }

    const finalSystemPrompt = `${systemPrompt}\n\nCRITICAL RULE: You are an AI assistant for this store. ONLY recommend products from the catalog provided below. Do not invent products.\n\n${productsContext}`;

    const response = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: finalSystemPrompt },
        { role: 'system', content: 'Please answer concisely in no more than two sentences and keep it under 70 words.' },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 80
    });

    return NextResponse.json({
      role: 'assistant',
      content: response.choices[0]?.message?.content || 'Sorry, I am having trouble connecting right now.'
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
