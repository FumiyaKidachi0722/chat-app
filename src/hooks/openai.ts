export const gptResponse = async (inputMessage: string) => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: inputMessage }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chat API error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { message?: string };
  return data.message ?? '';
};
