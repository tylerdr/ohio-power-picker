import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { publicAiEnabled, publicAiUnavailable, validateChatPayload } from '@/lib/public-ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  if (!publicAiEnabled()) {
    return publicAiUnavailable();
  }

  let body: { messages?: unknown; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON.', { status: 400 });
  }

  const validation = validateChatPayload(body.messages, body.context);
  if (!validation.ok) {
    return new Response(validation.error, { status: validation.status });
  }

  const messages = body.messages as Array<{ role: 'user' | 'assistant'; content: string }>;
  const context = typeof body.context === 'string' ? body.context : undefined;

  const systemPrompt = `You are a friendly, practical Ohio electricity neighbor. Answer clearly and calmly. Use plain English, short paragraphs, and bullets when helpful. Avoid salesy language. If a user asks for a recommendation, weigh price, rate stability, term length, ETFs, and intro rates. Flag variable rates and early termination fees. If a question cannot be answered from the provided context, say so and suggest what would help.\n\nSupplier context:\n${context ?? 'No supplier context provided.'}`;

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: 0.3,
    maxTokens: 700
  });

  return result.toDataStreamResponse();
}
