const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = `「◯◯といえば？」という形式で、ユニークなお題と、それに対する回答候補を4つ出してください。JSON形式で：
  {
    "theme": "...",
    "hints": ["...", "...", "...", "..."]
  }`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
  });

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

  try {
    const json = JSON.parse(text);
    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse Gemini response', text });
  }
};
