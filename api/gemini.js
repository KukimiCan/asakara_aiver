import GoogleGenerativeAI from '@google/genai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-2.0' });

export default async function handler(req, res) {
  const prompt = `
次の形式でJSONのみを返してください。説明・補足は禁止です：

{
  "theme": "お題（例：朝ごはん）",
  "hints": ["ヒント1", "ヒント2", "ヒント3", "ヒント4"]
}

「◯◯といえば？」という形式で、ユニークなお題と、それに対するヒントを4つ出してください。
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result?.response?.text();

    if (!text) {
      throw new Error('Geminiからの応答が空でした');
    }

    const jsonText = text.match(/\{[\s\S]*?\}/)?.[0];
    if (!jsonText) {
      throw new Error('JSONらしき部分が抽出できませんでした: ' + text);
    }

    const json = JSON.parse(jsonText);
    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({ error: 'Geminiの返答が取得できません', message: err.message });
  }
}
