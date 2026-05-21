const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function chatWithAI(
  messages: ChatMessage[],
  model = 'liquid/lfm-2.5-1.2b-instruct:free'
): Promise<string> {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes('ضع') || OPENROUTER_API_KEY.length < 10) {
    throw new Error('MISSING_KEY');
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AI Hub Arabia',
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const msg = errBody?.error?.message || response.statusText;
    if (response.status === 401) throw new Error('INVALID_KEY');
    throw new Error(msg);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? '';
}
