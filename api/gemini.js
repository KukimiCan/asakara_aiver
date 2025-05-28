import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // または 'gemini-1.5-pro'

export default async function handler(req, res) {
  const prompt = `
以下の形式でJSONのみを返してください。説明や補足は禁止です：

{
  "theme": "お題（例：「さ」で始まるこっそり持っているものとは？）",
  "hints": ["ヒント1", "ヒント2", "ヒント3", "ヒント4"]
}

ルール：
- お題は「ひらがな一文字」で始まる言葉を答えにする、「〜で始まる〇〇とは？」の形式にしてください。
- 毎回異なるひらがなと異なる〇〇を使用してください。
- 〇〇は、「人生で大切なもの」「こっそり楽しみにしていること」「朝にあるとうれしいもの」「机の中にあるもの」など、やや曖昧で想像力が試されるテーマにしてください。ただしテーマはここで挙げたものから選ぶのではなく，自由な発想で面白い物を考えてください．
- ヒントは「答えそのもの」は書かず、「それに関係する連想語」や具体例でヒントを出してください。
- 出力は日本語にし、テーマとヒントの形式は厳密に守ってください。
- ヒントの4つの言葉は、答えの最初のひらがなと一致する言葉で始めてください。

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
