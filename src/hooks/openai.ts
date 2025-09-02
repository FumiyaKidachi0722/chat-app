export const gptResponse = async (inputMessage: string) => {
  const key = typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') : null;
  // Soft handling: return a friendly message instead of throwing
  if (!key) {
    return 'OpenAI APIキーが未設定です。サイドバーの設定から登録してください。';
  }

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-openai-key': key,
      },
      body: JSON.stringify({ input: inputMessage }),
    });

    if (!res.ok) {
      // Try to surface a helpful, non-throwing message
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const j = (await res.json()) as { error?: string; message?: string };
        const m = j.message || j.error || '';
        if (res.status === 401 || /missing openai api key/i.test(m)) {
          return 'OpenAI APIキーが未設定です。サイドバーの設定から登録してください。';
        }
        if (res.status === 429 || /insufficient_quota|billing_not_active/i.test(m)) {
          return '現在AIが利用できません（429: 利用上限/請求設定をご確認ください）。';
        }
        return 'AI応答でエラーが発生しました。時間をおいて再試行してください。';
      }
      // text response
      const text = await res.text();
      if (res.status === 401 || /missing openai api key/i.test(text)) {
        return 'OpenAI APIキーが未設定です。サイドバーの設定から登録してください。';
      }
      if (res.status === 429) {
        return '現在AIが利用できません（429: 利用上限/請求設定をご確認ください）。';
      }
      return 'AI応答でエラーが発生しました。時間をおいて再試行してください。';
    }

    const data = (await res.json()) as { message?: string };
    return data.message ?? '';
  } catch {
    // Network or unexpected issue
    return 'AI応答でエラーが発生しました。時間をおいて再試行してください。';
  }
};
