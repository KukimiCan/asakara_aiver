import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "APIキーが設定されていません" });
  }

  const prompt = `
「◯◯といえば？」という形式で、ユニークなお題と、それに対する回答候補を4つ出してください。
以下の形式で、**JSONのみを返してください**（日本語の説明や補足は禁止）：

{
  "theme": "お題（例：朝ごはん）",
  "hints": ["ヒント1", "ヒント2", "ヒント3", "ヒント4"]
}
`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return res.status(500).json({ error: 'JSON形式の抽出に失敗', rawText: text });
    }

    const data = JSON.parse(match[0]);
    res.status(200).json(data);

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Geminiの返答が取得できません", message: error.message });
  }
}
