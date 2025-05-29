import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getRandomHiragana() {
  const hiraganas = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわ'.split('');
  return hiraganas[Math.floor(Math.random() * hiraganas.length)];
}

async function getRandomThemeWithPrefix() {
  const filePath = path.join(process.cwd(), 'themes.csv');
  const data = await fs.readFile(filePath, 'utf-8');
  const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const baseTheme = lines[Math.floor(Math.random() * lines.length)];
  const hira = getRandomHiragana();
  const fullTheme = `「${hira}」で始まる${baseTheme}`;
  return fullTheme;
}

function createPrompt(theme) {
  const match = theme.match(/^「(.+)」で始まる/);
  const requiredKana = match ? match[1] : null;

  return `
あなたは「朝からそれ正解」に参加しているAI回答者です。
次のお題に対して、参加者が出しそうな「単語」や「短いフレーズ」を5つ考えてください。

【重要な制約】
- 各回答は絶対に「${requiredKana}」で始まる言葉にしてください。
- 例：${requiredKana}で始まる → OK：「${requiredKana}いぬ」「${requiredKana}んぱく」「${requiredKana}ま」など
- 「${requiredKana}」で始まっていないもの（例：かいぬ、らんぱく、あまなど）は絶対に含めないでください。
- 回答がどれも「${requiredKana}」で始まっていない場合は再提出になります。

【出力形式】
以下の厳格なJSON形式で出力してください：
{
  "theme": "ここにお題を入れてください",
  "answers": [
    "回答1",
    "回答2",
    "回答3",
    "回答4",
    "回答5"
  ]
}

その他の制約：
- 各回答は文ではなく、単語または短い名詞句としてください（例：美しい花、黄色い犬など）
- 回答に重複がないようにしてください
- JSONの形式は絶対に守ってください

お題：「${theme}」
`;
}


export default async function handler(req, res) {
  try {
    const theme = await getRandomThemeWithPrefix();
    const prompt = createPrompt(theme);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-05-20',
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonText = text.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonText) {
      throw new Error('AIの出力からJSONを抽出できませんでした。');
    }

    const parsed = JSON.parse(jsonText);

    res.status(200).json({
      theme: parsed.theme,
      hints: parsed.answers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: err.message });
  }
}
