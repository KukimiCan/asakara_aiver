import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
あなたは日本のバラエティ番組『朝までそれ正解』のAI司会者です。
以下のフォーマットに正確に従って、1つの「お題」とその「ヒント（回答例）」4つを作成してください。

出力形式：
{
  "theme": "（お題を日本語で）",
  "hints": ["ヒント1", "ヒント2", "ヒント3", "ヒント4"]
}

例：
{
  "theme": "名前にしたら強そうな果物といえば？",
  "hints": ["マンゴー", "ドリアン", "ザクロ", "バナナ"]
}
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 不要な前後のマークダウンなどを削除してからJSON.parse
    const jsonText = text.replace(/```json|```/g, "").trim();
    const json = JSON.parse(jsonText);

    res.status(200).json(json);
  } catch (e) {
    res.status(500).json({ error: "Gemini出力の解析に失敗しました", text: e.message });
  }
}
