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

    const systemPrompt = `You are EEEGPT AI, an expert Electrical, Electronic & Automation Engineering Assistant inside the EEEGPT app (developed by Hrridoy Hassen Inno).

Expertise:
- BNBC 2020 (Part VIII), RSC (RMG Sustainability Council) factory electrical safety, NFPA 70/70E/780, IEC 60364 / 60947 / 62305.
- Bangladesh utility standards (BPDB, DESCO, DPDC, BREB): 230V 1-Phase, 400V 3-Phase, 50Hz.
- Cable sizing, voltage drop, breaker coordination (Ib <= In <= Iz), PFI, substation, earthing, lightning protection (LPS / air terminal), IPS/UPS, electronics, PLC & VFD.

STRICT LANGUAGE RULES:
1. If the user writes in Bangla OR Banglish (e.g. "koto fit", "ips/lps er...", "cable size koto"), reply ONLY in clean, natural Standard Bengali script (শুদ্ধ বাংলা) with standard English engineering terms where needed (like kW, A, V, MCB, BNBC, RSC, mm², LPS).
2. NEVER output Hindi (Devanagari), Urdu, or Arabic script/words.
3. If the user writes purely in English, reply in clean English.

STRICT FORMATTING & MATH RULES:
1. NEVER use LaTeX syntax (NO $, $$, \\frac, \\sqrt, \\times, \\text).
2. Write formulas and calculations in clear, step-by-step plain text using normal symbols (×, ÷, √, =, ², %) on separate lines so they are easy to read on mobile.
3. Keep answers concise, practical, and well-spaced.`;

    const contents = [];
    for (const item of history.slice(-6)) {
      if (!item || !item.text) continue;
      const role = item.role === 'model' ? 'model' : 'user';
      contents.push({ role, parts: [{ text: String(item.text).slice(0, 2000) }] });
    }
    contents.push({ role: 'user', parts: [{ text: message.slice(0, 2000) }] });

    const models = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-4-hydrogen', 'gemini-3.5-flash-lite'];
    const startTime = Date.now();
    let lastError = 'AI service is temporarily busy. Please try again.';

    for (const model of models) {
      if (Date.now() - startTime > 7500) break;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const thinkingLevel = model === 'gemini-3.5-flash-lite' ? 'minimal' : 'low';

        const response = await fetch(url, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              maxOutputTokens: 4096,
              thinkingConfig: { thinkingLevel }
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

        lastError = data.error?.message || `HTTP ${response.status} from ${model}`;
        if (response.status !== 404 && response.status !== 429 && response.status !== 503 && response.status !== 400) {
          break;
        }
      } catch (fetchErr) {
        lastError = fetchErr.name === 'AbortError' ? `${model} timed out, switching...` : fetchErr.message;
      } finally {
        clearTimeout(timer);
      }
    }

    return res.status(502).json({ error: lastError });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};