import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt) {
    return new Response('Missing prompt', { status: 400 });
  }

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    prompt,
    temperature: 0.3,
    maxTokens: 550
  });

  return result.toDataStreamResponse();
}
