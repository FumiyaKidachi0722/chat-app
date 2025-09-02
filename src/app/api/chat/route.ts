import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  // Parse input outside try so it's available in catch/fallbacks
  let userInput: string | undefined;
  try {
    const body = (await req.json()) as { input?: string };
    userInput = body?.input;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!userInput || typeof userInput !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Mock mode for development without paid quota
  if (process.env.MOCK_OPENAI === '1') {
    return NextResponse.json({ message: `Echo: ${userInput}` });
  }

  try {
    const headerKey = req.headers.get('x-openai-key')?.trim();
    const apiKey = headerKey || process.env.OPENAI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OpenAI API key. Set it in Settings.' },
        { status: 401 }
      );
    }

    const client = new OpenAI({ apiKey });
    const preferred = process.env.OPENAI_MODEL || 'o4-mini';

    const callModel = async (modelName: string): Promise<string> => {
      const useChat = /^gpt-(3\.5|4o)/.test(modelName);
      if (useChat) {
        const completion = await client.chat.completions.create({
          model: modelName,
          messages: [{ role: 'user', content: userInput }],
          max_tokens: 256,
          temperature: 0.7,
        });
        return completion.choices?.[0]?.message?.content ?? '';
      }
      const resp = await client.responses.create({
        model: modelName,
        // Use input + instructions (supported by current SDK types)
        input: userInput,
        instructions:
          'You are a helpful assistant. Reply briefly and clearly in the same language as the user. Keep the final answer under 150 tokens.',
        // o4-mini spends tokens on reasoning; raise the cap and lower effort so text is produced
        max_output_tokens: 1024,
        reasoning: { effort: 'low' as const },
        // Many Responses API models (e.g., o4-mini) don't support temperature
      });
      // Robust text extraction for Responses API
      const anyResp: any = resp as any;
      if (
        typeof anyResp?.output_text === 'string' &&
        anyResp.output_text.trim()
      ) {
        return anyResp.output_text.trim();
      }
      const parts: string[] = [];
      const takeContent = (contentArr: any[]) => {
        for (const c of contentArr) {
          // Typical shape: { type: 'output_text', text: { value: '...', annotations: [] } }
          if (c?.type === 'output_text' && typeof c?.text?.value === 'string') {
            parts.push(c.text.value);
          } else if (typeof c?.text?.value === 'string') {
            parts.push(c.text.value);
          } else if (typeof c?.text === 'string') {
            parts.push(c.text);
          } else if (Array.isArray(c?.content)) {
            takeContent(c.content);
          }
        }
      };
      if (Array.isArray(anyResp?.output)) {
        for (const item of anyResp.output) {
          if (Array.isArray(item?.content)) takeContent(item.content);
        }
      } else if (Array.isArray(anyResp?.content)) {
        takeContent(anyResp.content);
      }
      const joined = parts.join('\n').trim();
      if (joined) return joined;
      try {
        // dev logging of unexpected shape
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Responses API: unexpected no-text shape', JSON.stringify(anyResp).slice(0, 1500));
        }
      } catch {}
      // As a last resort
      const fb = anyResp?.choices?.[0]?.message?.content ?? '';
      return typeof fb === 'string' ? fb : '';
    };

    try {
      let message = await callModel(preferred);
      console.log('message: ', message);
      if (typeof message !== 'string' || message.trim().length === 0) {
        throw new Error('empty_response');
      }
      return NextResponse.json({ message });
    } catch (e: any) {
      const msg = String(e?.message || '');
      const isModelAccessError =
        e?.status === 403 ||
        e?.code === 'model_not_found' ||
        /does not have access to model/i.test(msg);
      const isInvalidKey =
        e?.status === 401 ||
        e?.code === 'invalid_api_key' ||
        /incorrect api key|invalid api key/i.test(msg);
      if (isInvalidKey) {
        return NextResponse.json({
          message: 'OpenAI APIキーが無効です。正しいキーをサイドバーの設定から登録してください。',
        });
      }
      const shouldFallback =
        isModelAccessError ||
        e?.status >= 500 ||
        msg.includes('empty_response') ||
        /invalid_response|parse|Unexpected/.test(msg);
      const fallback = 'gpt-3.5-turbo';
      if (preferred !== fallback && shouldFallback) {
        try {
          const m2 = await callModel(fallback);
          if (typeof m2 === 'string' && m2.trim()) {
            return NextResponse.json({ message: m2 });
          }
        } catch (e2) {
          // fall through to outer catch
        }
      }
      // Last-resort: return a friendly fallback so client doesn't break
      const fallbackText =
        'すみません、現在AI応答を生成できませんでした。内容をもう一度詳しく書いていただくか、時間をおいて再試行してください。';
      console.warn(
        'Returning fallback text due to empty or invalid response. err=',
        e
      );
      return NextResponse.json({ message: fallbackText });
    }
  } catch (err: any) {
    console.error('OpenAI API error:', err);
    const status = typeof err?.status === 'number' ? err.status : 500;
    const details = err?.message || 'Internal Server Error';

    const code = err?.code || err?.error?.code || err?.error?.type;
    const isBillingOrQuota =
      status === 429 &&
      (code === 'billing_not_active' || code === 'insufficient_quota');

    // Optional: fallback to mock on 429 to keep UI functional
    if (isBillingOrQuota && process.env.MOCK_ON_429 === '1') {
      return NextResponse.json({
        message:
          '現在AIが利用できません（請求/クレジット未設定または上限到達）。仮応答: ' +
          userInput,
      });
    }

    // Surface helpful error text to client, preserving status code
    return NextResponse.json({ error: `${status} ${details}` }, { status });
  }
}
