// ── Library Data ──────────────────────────────────────────────────────────────

export type LibraryId = 'html' | 'css' | 'javascript' | 'typescript' | 'c' | 'cpp' | 'swift'

export interface LibraryEntry {
  id: string
  name: string
  category: string
  description: string
  syntax: string
  language: LibraryId
  tags: string[]
  mdn?: string
}

export interface LibraryConfig {
  id: LibraryId
  label: string
  color: string
  bgColor: string
  textColor: string
  icon: string
  description: string
  entries: LibraryEntry[]
  categories: string[]
}

// ── Search ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  item: LibraryEntry
  score: number
  refIndex: number
}

export interface SearchQuery {
  term: string
  scope: LibraryId | 'all'
}

// ── AI / Chat ─────────────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export interface ChatRequest {
  messages: Array<{ role: ChatRole; content: string }>
  context?: LibraryId
}

export interface ChatResponse {
  message: string
  usage?: {
    input_tokens: number
    output_tokens: number
  }
}

// ── Router ────────────────────────────────────────────────────────────────────

export type RouteId = '/' | '/html' | '/css' | '/js' | '/ts' | '/c' | '/cpp' | '/swift' | '/agent'

export interface Route {
  id: RouteId
  path: string
  title: string
  render: () => Promise<void>
}

// ── Components ────────────────────────────────────────────────────────────────

export interface Component {
  render(): string
  mount(container: HTMLElement): void
  destroy?(): void
}

export interface CodeBlockOptions {
  code: string
  language: LibraryId | 'text'
  label?: string
}

export interface BookCardProps {
  library: LibraryConfig
  animationDelay?: number
}

// ── API ───────────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string
  code: number
}
