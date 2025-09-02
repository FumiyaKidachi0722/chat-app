import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Ensure Node.js runtime on Vercel (OpenAI SDK requires Node env)
export const runtime = 'nodejs';

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
    // Use ONLY user-provided key from the client. No server env fallback.
    const apiKey = headerKey || '';
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
      // Robust text extraction for Responses API (typed)
      if (typeof resp.output_text === 'string' && resp.output_text.trim()) {
        return resp.output_text.trim();
      }
      const parts: string[] = [];
      for (const item of resp.output) {
        if (item.type === 'message') {
          for (const c of item.content) {
            if (c.type === 'output_text' && typeof c.text === 'string') {
              parts.push(c.text);
            }
          }
        }
      }
      const joined = parts.join('\n').trim();
      if (joined) return joined;
      try {
        // dev logging of unexpected shape
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            'Responses API: unexpected no-text shape',
            JSON.stringify(resp).slice(0, 1500)
          );
        }
      } catch {
        void 0;
      }
      // As a last resort, return empty text
      return '';
    };

    try {
      const message = await callModel(preferred);
      console.warn('message: ', message);
      if (typeof message !== 'string' || message.trim().length === 0) {
        throw new Error('empty_response');
      }
      return NextResponse.json({ message });
    } catch (e: unknown) {
      const errObj = (e && typeof e === 'object')
        ? (e as Record<string, unknown>)
        : undefined;
      const msg = typeof errObj?.message === 'string' ? errObj.message : '';
      const status = typeof errObj?.status === 'number' ? errObj.status : undefined;
      const code = typeof errObj?.code === 'string' ? errObj.code : undefined;
      const isModelAccessError =
        status === 403 ||
        code === 'model_not_found' ||
        /does not have access to model/i.test(msg);
      const isInvalidKey =
        status === 401 ||
        code === 'invalid_api_key' ||
        /incorrect api key|invalid api key/i.test(msg);
      if (isInvalidKey) {
        return NextResponse.json({
          message:
            'OpenAI APIキーが無効です。正しいキーをサイドバーの設定から登録してください。',
        });
      }
      const shouldFallback =
        isModelAccessError ||
        (typeof status === 'number' && status >= 500) ||
        msg.includes('empty_response') ||
        /invalid_response|parse|Unexpected/.test(msg);
      const fallback = 'gpt-3.5-turbo';
      if (preferred !== fallback && shouldFallback) {
        try {
          const m2 = await callModel(fallback);
          if (typeof m2 === 'string' && m2.trim()) {
            return NextResponse.json({ message: m2 });
          }
        } catch {
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
  } catch (err: unknown) {
    console.error('OpenAI API error:', err);
    const errObj = (err && typeof err === 'object')
      ? (err as Record<string, unknown>)
      : undefined;
    const status = typeof errObj?.status === 'number' ? errObj.status : 500;
    const details = typeof errObj?.message === 'string' ? errObj.message : 'Internal Server Error';
    const nested = (errObj?.error && typeof errObj.error === 'object' && errObj.error !== null)
      ? (errObj.error as Record<string, unknown>)
      : undefined;
    const code =
      (typeof errObj?.code === 'string' ? errObj.code : undefined) ||
      (typeof nested?.code === 'string' ? nested.code : undefined) ||
      (typeof nested?.type === 'string' ? nested.type : undefined);
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
