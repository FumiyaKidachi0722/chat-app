import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    const preferred = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

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
        input: userInput,
        max_output_tokens: 256,
        // Many Responses API models (e.g., o4-mini) don't support temperature
      });
      return (
        (resp as any).output_text ||
        ((resp as any).output?.[0]?.content?.[0]?.text?.value ?? '')
      );
    };

    try {
      const message = await callModel(preferred);
      return NextResponse.json({ message });
    } catch (e: any) {
      const isModelAccessError =
        e?.status === 403 || e?.code === 'model_not_found' ||
        /does not have access to model/i.test(String(e?.message || ''));
      if (!isModelAccessError) throw e;
      // Fallback to a broadly available legacy model
      const fallback = 'gpt-3.5-turbo';
      if (preferred !== fallback) {
        const message = await callModel(fallback);
        return NextResponse.json({ message });
      }
      throw e;
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
