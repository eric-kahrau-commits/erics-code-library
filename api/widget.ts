import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Du bist ein freundlicher und kompetenter Code-Assistent für eine Schul-Code-Library.
Du hilfst Schülern dabei, HTML, CSS, JavaScript, TypeScript, C, C++ und Swift zu lernen.
Antworte immer auf Deutsch, kurz, präzise und verständlich.
Verwende einfache Sprache, da die Zielgruppe Schüler sind.`

function sanitize(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message } = req.body

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Nachricht fehlt.' })
  }

  const sanitized = sanitize(message).slice(0, 500)

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\nAntworte sehr kurz (max. 2-3 Sätze).` },
        { role: 'user', content: sanitized },
      ],
    })

    const content = completion.choices[0]?.message?.content ?? ''
    return res.json({ message: content })
  } catch (err) {
    console.error('[/api/widget]', err)
    return res.status(500).json({ error: 'Fehler beim Verarbeiten der Anfrage.' })
  }
}
