export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = `
「◯◯といえば？」という形式で、ユニークなお題と、それに対する回答候補を4つ出してください。
以下の形式で、**JSONのみを返してください**（日本語の説明や補足は禁止）：

{
  "theme": "お題（例：朝ごはん）",
  "hints": ["ヒント1", "ヒント2", "ヒント3", "ヒント4"]
}
`;

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    });

    const result = await response.json();
    console.log('Gemini response:', JSON.stringify(result, null, 2)); // ★ログ追加

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({ error: 'Geminiの返答が取得できません', result });
    }

    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'JSON形式が見つかりません', raw: text });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.status(200).json(parsed);
  } catch (err) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
