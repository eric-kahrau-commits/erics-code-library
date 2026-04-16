import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Du bist ein freundlicher und kompetenter Code-Assistent für eine Schul-Code-Library.
Du hilfst Schülern dabei, HTML, CSS, JavaScript, TypeScript, C, C++ und Swift zu lernen.
Antworte immer auf Deutsch, kurz, präzise und verständlich.
Gib konkrete Code-Beispiele wenn sie hilfreich sind.
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

  const { messages, context } = req.body

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Nachrichten fehlen.' })
  }

  if (messages.length > 50) {
    return res.status(400).json({ error: 'Zu viele Nachrichten im Verlauf.' })
  }

  const sanitizedMessages = messages.map((m: any) => ({
    role: m.role as 'user' | 'assistant',
    content: sanitize(String(m.content)).slice(0, 2000),
  }))

  const systemContent = context
    ? `${SYSTEM_PROMPT}\n\nDer Nutzer fragt aktuell über ${String(context).toUpperCase()} nach.`
    : SYSTEM_PROMPT

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemContent },
        ...sanitizedMessages,
      ],
    })

    const content = completion.choices[0]?.message?.content ?? ''
    return res.json({ message: content, usage: completion.usage })
  } catch (err) {
    console.error('[/api/chat]', err)
    return res.status(500).json({ error: 'Fehler beim Verarbeiten der Anfrage.' })
  }
}
