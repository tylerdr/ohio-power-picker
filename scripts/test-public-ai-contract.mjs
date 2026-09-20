import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const helper = read('lib/public-ai.ts');
const chat = read('app/api/chat/route.ts');
const recommend = read('app/api/recommend/route.ts');
const env = read('.env.example');

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

assert(helper.includes("process.env.NODE_ENV !== 'production' || process.env.OHIO_POWER_AI_ENABLED === 'true'"), 'Production AI must require explicit opt-in.');
assert(env.includes('OHIO_POWER_AI_ENABLED=false'), 'Example env must default public AI closed.');

for (const [name, source] of [['chat', chat], ['recommend', recommend]]) {
  const gateIndex = source.indexOf('publicAiEnabled()');
  const providerIndex = source.indexOf("openai('gpt-4o-mini')");
  assert(gateIndex >= 0, `${name} route is missing the public AI gate.`);
  assert(providerIndex >= 0, `${name} route is missing the expected provider invocation.`);
  assert(gateIndex < providerIndex, `${name} route must fail closed before provider invocation.`);
  assert(source.includes('publicAiUnavailable()'), `${name} route must return the closed-state response.`);
}

assert(helper.includes('MAX_CHAT_MESSAGES = 12'), 'Chat history bound must be explicit.');
assert(helper.includes('MAX_CHAT_MESSAGE_CHARS = 8_000'), 'Chat message-size bound must be explicit.');
assert(helper.includes('MAX_CHAT_CONTEXT_CHARS = 24_000'), 'Chat context-size bound must be explicit.');
assert(helper.includes('MAX_RECOMMEND_PROMPT_CHARS = 4_000'), 'Recommendation prompt-size bound must be explicit.');
assert(chat.includes('validateChatPayload'), 'Chat route must validate the bounded payload before provider use.');
assert(recommend.includes('validateRecommendPrompt'), 'Recommend route must validate the bounded prompt before provider use.');

if (failures.length) {
  console.error(`Public AI contract checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Public AI contract checks passed.');
