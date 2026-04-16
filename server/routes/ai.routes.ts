import { Router, Request, Response } from 'express'
import OpenAI from 'openai'

const router = Router()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Du bist ein freundlicher und kompetenter Code-Assistent für eine Schul-Code-Library.
Du hilfst Schülern dabei, HTML, CSS, JavaScript und TypeScript zu lernen.
Antworte immer auf Deutsch, kurz, präzise und verständlich.
Gib konkrete Code-Beispiele wenn sie hilfreich sind.
Verwende einfache Sprache, da die Zielgruppe Schüler sind.`

function sanitize(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

// POST /api/chat – voller Chatverlauf (AgentPage)
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, context } = req.body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
      context?: string
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Nachrichten fehlen.' })
      return
    }

    if (messages.length > 50) {
      res.status(400).json({ error: 'Zu viele Nachrichten im Verlauf.' })
      return
    }

    const sanitizedMessages = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: sanitize(String(m.content)).slice(0, 2000),
    }))

    const systemContent = context
      ? `${SYSTEM_PROMPT}\n\nDer Nutzer fragt aktuell über ${context.toUpperCase()} nach.`
      : SYSTEM_PROMPT

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemContent },
        ...sanitizedMessages,
      ],
    })

    const content = completion.choices[0]?.message?.content ?? ''

    res.json({
      message: content,
      usage: completion.usage,
    })
  } catch (err) {
    console.error('[/api/chat]', err)
    res.status(500).json({ error: 'Fehler beim Verarbeiten der Anfrage.' })
  }
})

// POST /api/widget – Einzelnachricht (AgentWidget auf Homepage)
router.post('/widget', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body as { message: string }

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Nachricht fehlt.' })
      return
    }

    const sanitized = sanitize(message).slice(0, 500)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\nAntworte sehr kurz (max. 2-3 Sätze).` },
        { role: 'user', content: sanitized },
      ],
    })

    const content = completion.choices[0]?.message?.content ?? ''

    res.json({ message: content })
  } catch (err) {
    console.error('[/api/widget]', err)
    res.status(500).json({ error: 'Fehler beim Verarbeiten der Anfrage.' })
  }
})

// GET /api/health
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router
