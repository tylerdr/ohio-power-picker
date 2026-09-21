const MAX_CHAT_MESSAGES = 12;
const MAX_CHAT_MESSAGE_CHARS = 8_000;
const MAX_CHAT_CONTEXT_CHARS = 24_000;
const MAX_RECOMMEND_PROMPT_CHARS = 4_000;

export const publicAiEnabled = () =>
  process.env.NODE_ENV !== 'production' || process.env.OHIO_POWER_AI_ENABLED === 'true';

export const publicAiUnavailable = () =>
  new Response('AI assistance is temporarily unavailable.', {
    status: 503,
    headers: { 'Cache-Control': 'no-store' },
  });

export function validateChatPayload(messages: unknown, context: unknown) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_CHAT_MESSAGES) {
    return { ok: false as const, status: 400, error: 'Invalid messages.' };
  }

  let totalChars = 0;
  for (const message of messages) {
    if (!message || typeof message !== 'object') {
      return { ok: false as const, status: 400, error: 'Invalid message.' };
    }
    const role = (message as { role?: unknown }).role;
    const content = (message as { content?: unknown }).content;
    if (!['user', 'assistant'].includes(String(role)) || typeof content !== 'string') {
      return { ok: false as const, status: 400, error: 'Invalid message.' };
    }
    totalChars += content.length;
  }

  if (totalChars > MAX_CHAT_MESSAGE_CHARS) {
    return { ok: false as const, status: 413, error: 'Conversation too large.' };
  }

  if (context != null && (typeof context !== 'string' || context.length > MAX_CHAT_CONTEXT_CHARS)) {
    return { ok: false as const, status: 413, error: 'Context too large.' };
  }

  return { ok: true as const };
}

export function validateRecommendPrompt(prompt: unknown) {
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return { ok: false as const, status: 400, error: 'Missing prompt.' };
  }
  if (prompt.length > MAX_RECOMMEND_PROMPT_CHARS) {
    return { ok: false as const, status: 413, error: 'Prompt too large.' };
  }
  return { ok: true as const };
}
