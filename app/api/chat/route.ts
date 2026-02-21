import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  if (!messages) {
    return new Response('Missing messages', { status: 400 });
  }

  const systemPrompt = `You are a friendly, practical Ohio electricity neighbor. Answer clearly and calmly. Use plain English, short paragraphs, and bullets when helpful. Avoid salesy language. If a user asks for a recommendation, weigh price, rate stability, term length, ETFs, and intro rates. Flag variable rates and early termination fees. If a question cannot be answered from the provided context, say so and suggest what would help.

Supplier context:\n${context ?? 'No supplier context provided.'}`;

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: 0.3,
    maxTokens: 700
  });

  return result.toDataStreamResponse();
}
