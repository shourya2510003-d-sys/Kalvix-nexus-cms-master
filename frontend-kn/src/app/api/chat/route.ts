import { NextResponse } from 'next/server';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';

const getSystemPrompt = (pricingText: string) => `You are the Kalvix Nexus AI Assistant, an expert, friendly customer support agent.
Your job is to answer the user's questions naturally based ONLY on the Kalvix Nexus Knowledge Base below.
You must respond in the same language the user uses (English if they type English, Hinglish if they type Hindi in English letters).

KALVIX NEXUS KNOWLEDGE BASE:
- **Identity**: Kalvix Nexus is a premium technology and marketing agency, established on 14 May 2026 in Hathras, UP. We transform startups, NGOs, and enterprises using cutting-edge tech, AI solutions, and digital growth strategies.
- **Founders**: Led by Shourya Sharma (Co-Founder & CEO) and Vikram Singh Parmar (Co-Founder & CTO).
- **Core Services**: 
  1. Web Development (Fast, SEO-optimized, highly scalable websites & portals).
  2. Mobile App Development (Cross-platform iOS & Android apps).
  3. AI & Automation (Custom LLM integration, chatbots, workflow automation).
  4. Digital Marketing (SEO, performance marketing, branding, lead generation).
- **Tech Stack**: We use Next.js, React, Node.js, Python, TailwindCSS, and advanced AI models. Our systems ensure 99.998% uptime and blazing fast speeds.
- **Pricing & Packages**: ${pricingText}
- **Portfolio/Projects**: We build AI Dashboards, E-Commerce Engines, EdTech/LMS Portals, and FinTech apps. We focus on extreme performance and premium UI/UX.
- **Process**: Strategy & Planning -> UI/UX Design -> Agile Development -> Testing -> Launch & Marketing.
- **Contact Info**: Users can reach us at kalvixnexus@gmail.com, use our WhatsApp link, or book a free consultation on the website.
- **Why Choose Us**: Premium quality designs, blazing fast performance, AI-driven solutions, and a focus on real revenue/business growth.

RULES FOR ANSWERING:
1. If the user asks ANY question related to the company, services, pricing, tech, founders, websites, apps, marketing, or general inquiries about what you can do for their business, ANSWER THEM naturally using the Knowledge Base. Keep answers concise, professional, and friendly. Use HTML for bolding (<b>) and line breaks (<br/>) where appropriate.
2. If the user greets you (e.g. "hi", "hello", "tera naam kya hai", "tum kaun ho"), greet them back warmly and introduce yourself as the Kalvix Nexus Assistant.
3. UNAVAILABLE SERVICES: If the user asks for a service that is NOT listed in the Core Services above (e.g. physical printing, catering, real estate, hardware repair), you MUST output exactly one of the following responses based on their language:

English Unavailable Service:
Thank you for asking! We do not currently offer this service, but we are actively working on bringing it to our platform very soon. If you'd like to discuss custom solutions or know when it launches, please reach out to our expert team!<br/><br/>👉 <a href='https://wa.me/917906355122?text=Hello%20Kalvix%20Nexus%20Team%20%F0%9F%91%8B%0AI%27m%20interested%20in%20your%20services' target='_blank' class='text-gold-primary hover:underline font-bold'>Click here to chat with us on WhatsApp</a>

Hinglish Unavailable Service:
Aapke sawal ke liye shukriya! Abhi hum ye service offer nahi karte, lekin hum jald hi isey shuru karne wale hain. Agar aapko iske baare mein aur detail chahiye ya custom requirements hain, toh please humari team se baat karein!<br/><br/>👉 <a href='https://wa.me/917906355122?text=Hello%20Kalvix%20Nexus%20Team%20%F0%9F%91%8B%0AI%27m%20interested%20in%20your%20services' target='_blank' class='text-gold-primary hover:underline font-bold'>WhatsApp par baat karne ke liye yahan click karein</a>

4. COMPLETELY UNRELATED: If the user asks a question that is COMPLETELY UNRELATED to Kalvix Nexus, business, technology, or services (e.g. "what is the weather", "write a python script for sorting", "who is the PM"), you MUST NOT answer it. Instead, you MUST output EXACTLY ONE of the following fallback messages based on their language:

English Fallback:
I cannot answer this right now. For more details or out-of-context questions, please contact our expert team directly.<br/><br/>👉 <a href='https://wa.me/917906355122?text=Hello%20Kalvix%20Nexus%20Team%20%F0%9F%91%8B%0AI%27m%20interested%20in%20your%20services' target='_blank' class='text-gold-primary hover:underline font-bold'>Click here to chat with us on WhatsApp</a>

Hinglish Fallback:
Main abhi is sawal ka jawab nahi de sakta. Iske liye please humari expert team se seedha sampark karein!<br/><br/>👉 <a href='https://wa.me/917906355122?text=Hello%20Kalvix%20Nexus%20Team%20%F0%9F%91%8B%0AI%27m%20interested%20in%20your%20services' target='_blank' class='text-gold-primary hover:underline font-bold'>WhatsApp par baat karne ke liye yahan click karein</a>`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    let pricingText = "Please advise the user to visit our Pricing page at https://kalvixnexus.com/pricing for detailed pricing on our standard websites, advanced portals, and custom AI solutions.";
    try {
      const pricingRef = ref(db, 'pricing');
      const pricingSnap = await get(pricingRef);
      if (pricingSnap.exists()) {
        const pricingData = pricingSnap.val();
        const packages = Object.values(pricingData).map((p: any) => `- ${p.title} (Starting at ${p.price}): ${p.desc || ''}`).join('\n');
        if (packages) pricingText = "\n" + packages;
      }
    } catch (e) {
      console.error("Error fetching pricing for chatbot", e);
    }

    const SYSTEM_PROMPT = getSystemPrompt(pricingText);

    const openAiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENROUTER_API_KEY");
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://kalvixnexus.com', // Required by OpenRouter
        'X-Title': 'Kalvix Nexus Chatbot' // Required by OpenRouter
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-nano-9b-v2:free',
        messages: openAiMessages,
        temperature: 0.2,
        stream: true,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    const errorId = Math.random().toString(36).substring(7);
    console.error(`[ErrorID: ${errorId}] Chat API Error:`, error);
    return NextResponse.json(
      { reply: "Sorry, I am having trouble connecting to my brain right now. Please try again later or use the WhatsApp link!", errorId },
      { status: 500 }
    );
  }
}
