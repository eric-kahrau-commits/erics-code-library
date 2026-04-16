import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import aiRouter from './routes/ai.routes.js'

// ── Startup Check ─────────────────────────────────────────────────────────────
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
  console.error('\n❌ OPENAI_API_KEY ist nicht gesetzt!')
  console.error('   Bitte trage deinen OpenAI API-Key in die .env Datei ein.\n')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT ?? 3001

// ── CORS ──────────────────────────────────────────────────────────────────────
// In .env: ALLOWED_ORIGINS=https://dein-projekt.vercel.app,https://andere-domain.com
const allowedOrigins: string[] = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:4173']

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests ohne Origin (z.B. curl, Postman) in Dev erlauben
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS: Origin nicht erlaubt: ${origin}`))
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }),
)

// ── Body Parser ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))

// ── Rate Limiter ───────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 30,
  message: { error: 'Zu viele Anfragen. Bitte warte einen Moment.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', limiter)

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api', aiRouter)

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Server läuft auf http://localhost:${PORT}`)
  console.log(`   KI-Endpunkte: /api/chat, /api/widget, /api/health\n`)
})

export default app
