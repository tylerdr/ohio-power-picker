import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { publicAiEnabled, publicAiUnavailable, validateRecommendPrompt } from '@/lib/public-ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  if (!publicAiEnabled()) {
    return publicAiUnavailable();
  }

  let body: { prompt?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON.', { status: 400 });
  }

  const validation = validateRecommendPrompt(body.prompt);
  if (!validation.ok) {
    return new Response(validation.error, { status: validation.status });
  }

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    prompt: body.prompt as string,
    temperature: 0.3,
    maxTokens: 550
  });

  return result.toDataStreamResponse();
}
