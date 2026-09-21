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

  const systemPrompt = `You are a friendly, practical explainer for an archived Ohio electricity-rate snapshot. Answer clearly and calmly. Use plain English, short paragraphs, and bullets when helpful. Avoid salesy language.

IMPORTANT DATA BOUNDARY:
- The supplier context is point-in-time repository data, not a live market feed.
- Supplier offers were scraped March 15, 2026 unless the supplied context proves a newer source date.
- Utility Price to Compare values in the app are static repository values and are not verified live.
- Never describe a stored rate, plan, supplier availability, savings estimate, or utility benchmark as current, live, guaranteed, enrollment-ready, or the best plan now.
- You may explain stored terms and compare the archived rows, but any recommendation must be framed as a plan worth re-checking rather than a plan to enroll in.
- Tell users to verify current supplier pricing, eligibility, contract terms, fees, renewal conditions, and the applicable utility benchmark with PUCO Apples to Apples and the supplier before enrollment.
- If a question cannot be answered from the provided context, say so and identify what current evidence is needed.

Supplier context:\n${context ?? 'No supplier context provided.'}`;

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: 0.3,
    maxTokens: 700
  });

  return result.toDataStreamResponse();
}
