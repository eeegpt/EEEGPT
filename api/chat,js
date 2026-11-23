module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server error: GEMINI_API_KEY is not set in Vercel.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const message = String(body.message || '').trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const systemPrompt = `You are EEEGPT AI, a smart Electrical, Electronic & Automation Engineering Assistant inside the EEEGPT app (developed by Hrridoy Hassen Inno).
Your expertise includes:
- Bangladesh National Building Code (BNBC 2020 Part VIII), RSC (RMG Sustainability Council) factory electrical safety guidelines, NFPA 70/70E/780, and IEC 60364 / 60947 / 62305.
- Bangladesh utility standards (BPDB, DESCO, DPDC, BREB): 230V 1-Phase, 400V 3-Phase, 50Hz.
- Cable sizing, voltage drop, breaker coordination (Ib <= In <= Iz), PFI/capacitor bank, substation/fault kA, earthing, IPS/UPS, electronics, PLC & VFD automation.

Rules:
- Reply in the exact language the user uses (Bangla, Banglish, or English).
- Give clear, practical, structured engineering answers with formulas or code references where helpful.
- Keep answers concise and easy to read on mobile.
- Remind users to verify critical site safety or compliance decisions with a licensed engineer.`;

    const contents = [];
    for (const item of history.slice(-6)) {
      if (!item || !item.text) continue;
      const role = item.role === 'model' ? 'model' : 'user';
      contents.push({ role, parts: [{ text: String(item.text).slice(0, 2000) }] });
    }
    contents.push({ role: 'user', parts: [{ text: message.slice(0, 2000) }] });

    const models = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.8-flash'];
    let lastError = 'AI service is temporarily busy. Please try again.';

    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1200
          }
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.candidates && data.candidates[0]?.content?.parts) {
        const reply = data.candidates[0].content.parts
          .filter(p => p.text && !p.thought)
          .map(p => p.text)
          .join('')
          .trim();

        if (reply) {
          return res.status(200).json({ reply, model });
        }
      }

      lastError = data.error?.message || lastError;
      if (response.status !== 404 && response.status !== 429 && response.status !== 503) {
        break;
      }
    }

    return res.status(502).json({ error: lastError });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};