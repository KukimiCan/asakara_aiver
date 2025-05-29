// api/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end("Method Not Allowed");
    return;
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "プロンプトが指定されていません" });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    res.status(200).json({
      candidates: [
        { content: { parts: [{ text }] } }
      ]
    });
  } catch (err) {
    console.error("Geminiエラー:", err);
    res.status(500).json({ error: "Geminiの返答が取得できません", message: err.message });
  }
}
