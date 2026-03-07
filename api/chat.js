export default async function handler(req, res) {
  // 1) Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 2) Read messages from the request body
    const { messages } = req.body || {};

    // 3) Basic validation so we get clear errors
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    // 4) Call Groq
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.GROQ_API_KEY,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 300,
          messages,
        }),
      }
    );

    const data = await response.json();

    // 5) If Groq returns an error, forward it to the browser
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || data,
      });
    }

    // 6) Success: send Groq’s reply back
    return res.status(200).json(data);
  } catch (err) {
    // 7) Catch unexpected server errors
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
