import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // または 'gemini-1.5-pro'

export default async function handler(req, res) {
  const prompt = `
以下の形式でJSONのみを返してください。説明や補足は禁止です：

{
  "theme": "お題（例：「あ」で始まる朝にあるとうれしいものとは？）",
  "hints": ["ヒント1", "ヒント2", "ヒント3", "ヒント4"]
}

ルール：
- お題は「◯（ひらがな1文字）で始まる○○とは？」という形式にしてください。
- ○○には「人生に大切なもの」「なくなると困るもの」「朝にあるとうれしいもの」「こっそり持ってるもの」など、日常的かつ曖昧なテーマを使ってください。
- ヒントは、正解を直接言わず、連想的なキーワードや具体例でヒントを出してください（例：「〇〇で始まる懐かしいもの」なら「放課後」「紙のにおい」「卒業」「あの曲」など）。
- すべて日本語で出力してください。

`;

  try {
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    const jsonText = text.match(/\{[\s\S]*?\}/)?.[0];
    const json = JSON.parse(jsonText);
    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({
      error: 'Geminiの返答が取得できません',
      message: err.message,
    });
  }
}
