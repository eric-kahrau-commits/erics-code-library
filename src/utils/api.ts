import type { ChatMessage, ChatResponse, LibraryId } from '../types/index.js'

export async function sendChatMessage(
  messages: Array<{ role: ChatMessage['role']; content: string }>,
  context?: LibraryId,
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }))
    throw new Error((err as { error: string }).error || `HTTP ${response.status}`)
  }

  const data: ChatResponse = await response.json()
  return data.message
}

export async function sendWidgetMessage(message: string): Promise<string> {
  const response = await fetch('/api/widget', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }))
    throw new Error((err as { error: string }).error || `HTTP ${response.status}`)
  }

  const data: ChatResponse = await response.json()
  return data.message
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health')
    return res.ok
  } catch {
    return false
  }
}
