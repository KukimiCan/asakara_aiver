import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getRandomHiragana() {
  const hiraganas = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.split('');
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
  return `
あなたは「朝からそれ正解」に参加しているAI回答者です。
次のお題に対して、5人の参加者が出しそうな「単語」や「短いフレーズ」を考えてください。

- 回答は絶対に文（〜です。〜だと思います等）にしないでください。補足や説明は不要です．
- 回答は名詞や形容詞を中心に、単語または修飾語を含んだ短いフレーズにしてください。

出力形式は必ず次のJSON形式に従ってください：

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

テーマ：「${theme}」
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
