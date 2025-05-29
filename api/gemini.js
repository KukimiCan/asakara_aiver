import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

function extractTargetKana(theme) {
  const match = theme.match(/「(.{1})」で始まる/);
  return match ? match[1] : null;
}

function allHintsStartWith(hints, kana) {
  return hints.every(hint => hint.startsWith(kana));
}

async function getValidProblem(maxAttempts = 5) {
  const prompt = `
以下の形式でJSONのみを返してください。説明・補足は禁止です。

{
  "theme": "「◯」で始まる◯◯とは？",
  "hints": ["ヒント1", "ヒント2", "ヒント3", "ヒント4"]
}

条件：
- テーマは「◯で始まる◯◯とは？」というフォーマットで、お題は毎回ランダムに変えてください。
- ◯の部分（文字）は日本語のひらがな一文字（例：「あ」「け」など）にしてください。
- ◯◯は、抽象的なもの（例：人生で大切なもの、秘密にしているもの、机の中にあるもの、朝にあるとうれしいものなど）としてください。
- hints は、答えを直接表すものではなく、「テーマの答えに関係する連想語や具体例」としてください。
- hints の4つの単語は、すべて指定されたひらがなで始まる単語にしてください。
- 出力は JSON のみ、余計な文は書かないでください。
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
    const json = await getValidProblem();
    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({ error: 'Geminiの返答が取得できません', message: err.message });
  }
}
