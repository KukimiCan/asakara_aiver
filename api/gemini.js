import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

function extractTargetKana(theme) {
  const match = theme.match(/「(.{1})」で始まる/);
  return match ? match[1] : null;
}

function allHintsStartWith(hints, kana) {
  return hints.every(hint => {
    const firstChar = hint[0];
    return firstChar === kana && /^[\u3041-\u3096]/.test(firstChar); // ひらがなチェック
  });
}

async function getValidProblem(maxAttempts = 5) {
  const prompt = `
以下の形式でJSONのみを返してください。説明・補足は禁止です。

{
  "theme": "「◯」で始まる◯◯とは？",
  "hints": ["ヒント1", "ヒント2", "ヒント3", "ヒント4"]
}

条件：
- theme は次のサイトから選択してください．http://minasa.seesaa.net/article/397259675.html
- hints は、指定されたひらがな（theme 内の「◯」）で始まる、答えとなる日本語の単語4つにしてください。
- ヒントの各単語は必ずひらがな一文字から始まっていなければなりません（カタカナ・漢字・ローマ字不可）。
- 必ず JSON オブジェクトだけを返し、補足・解説・説明は禁止です。

`;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonText = text.match(/\{[\s\S]*?\}/)?.[0];
      if (!jsonText) continue;

      const json = JSON.parse(jsonText);
      const kana = extractTargetKana(json.theme);

      if (!kana || !Array.isArray(json.hints) || json.hints.length !== 4) continue;
      if (allHintsStartWith(json.hints, kana)) return json;
    } catch {
      continue;
    }
  }

  throw new Error('有効な問題の生成に失敗しました。');
}

export default async function handler(req, res) {
  try {
    const json = await getValidProblem(8);
    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({ error: 'Geminiの返答が取得できません', message: err.message });
  }
}
