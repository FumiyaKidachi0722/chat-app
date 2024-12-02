import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const gpt3Response = async (inputMessage: string) => {
  const response = await openai.chat.completions.create({
    messages: [{ role: 'user', content: inputMessage }],
    model: 'gpt-3.5-turbo',
  });

  return response;
};
