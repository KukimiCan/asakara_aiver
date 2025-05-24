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

{
  "theme": "...",
  "hints": ["...", "...", "...", "..."]
}`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    })
  });

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  try {
    const json = JSON.parse(text);
    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse Gemini response', text });
  }
}
