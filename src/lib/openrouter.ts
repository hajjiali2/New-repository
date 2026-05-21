const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const FREE_MODELS = [
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
  'openrouter/free',
];

async function callModel(messages: ChatMessage[], model: string): Promise<string> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AI Hub Arabia',
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const msg = errBody?.error?.message || response.statusText;
    if (response.status === 401) throw new Error('INVALID_KEY');
    throw new Error(msg);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('empty response');
  return content;
}

export async function chatWithAI(
  messages: ChatMessage[],
  model?: string
): Promise<string> {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes('ضع') || OPENROUTER_API_KEY.length < 10) {
    throw new Error('MISSING_KEY');
  }

  const modelsToTry = model ? [model] : FREE_MODELS;

  let lastError: Error = new Error('فشل الاتصال');
  for (const m of modelsToTry) {
    try {
      return await callModel(messages, m);
    } catch (err: any) {
      if (err.message === 'INVALID_KEY') throw err;
      lastError = err;
    }
  }

  throw lastError;
}
