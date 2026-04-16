import type { ChatMessage } from '../types/index.js'
import { sendChatMessage } from '../utils/api.js'
import { navigateTo } from '../router.js'

export class AgentPage {
  private messages: ChatMessage[] = []
  private isLoading = false

  async render(): Promise<void> {
    const app = document.getElementById('app')
    if (!app) return

    this.messages = []

    app.innerHTML = `
      <div class="agent-page">
        <div class="agent-page__header">
          <div class="agent-page__header-left">
            <button
              style="padding:var(--space-2) var(--space-3); border-radius:var(--radius-md); background:var(--color-bg-secondary); border:1px solid var(--color-border); cursor:pointer; display:flex; align-items:center; gap:var(--space-2); font-size:var(--text-sm); color:var(--color-text-muted); font-family:inherit;"
              id="agent-back"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Zurück
            </button>

            <div class="agent-page__avatar">🤖</div>
            <div>
              <div class="agent-page__name">Code-Assistent</div>
              <div class="agent-page__subtitle">
                <div class="agent-page__online"></div>
                Powered by Claude AI
              </div>
            </div>
          </div>

          <div style="display:flex; gap:var(--space-2);">
            <button
              class="btn btn--secondary btn--sm"
              id="agent-clear"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
              </svg>
              Chat leeren
            </button>
          </div>
        </div>

        <div class="agent-page__messages" id="chat-messages">
          ${this.renderWelcome()}
        </div>

        <div class="agent-page__input-area">
          <div class="agent-page__input-wrap">
            <textarea
              class="agent-page__textarea"
              placeholder="Schreib eine Nachricht… (Enter zum Senden, Shift+Enter für neue Zeile)"
              id="chat-input"
              rows="1"
            ></textarea>
            <button class="agent-page__send" id="chat-send" aria-label="Senden">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <p class="agent-page__hint">Enter = Senden · Shift+Enter = Neue Zeile</p>
        </div>
      </div>
    `

    this.mountEvents(app)
  }

  private renderWelcome(): string {
    const suggestions = [
      'Was ist der Unterschied zwischen let und const?',
      'Wie funktioniert Flexbox?',
      'Erkläre mir TypeScript Generics.',
      'Was ist das HTML Box Model?',
    ]

    return `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:300px; text-align:center; gap: var(--space-6);">
        <div>
          <div style="font-size:3rem; margin-bottom:var(--space-4);">🤖</div>
          <h2 style="font-size:var(--text-2xl); font-weight:800; color:var(--color-text); margin-bottom:var(--space-2);">
            Hallo! Ich bin dein Code-Assistent.
          </h2>
          <p style="color:var(--color-text-muted); max-width:400px; line-height:1.6;">
            Ich helfe dir beim Lernen von HTML, CSS, JavaScript und TypeScript.
            Stell mir einfach eine Frage!
          </p>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:var(--space-3); justify-content:center; max-width:600px;">
          ${suggestions.map(s => `
            <button
              class="btn btn--secondary btn--sm"
              data-suggestion="${s}"
              style="font-size:var(--text-xs);"
            >
              ${s}
            </button>
          `).join('')}
        </div>
      </div>
    `
  }

  private renderMessage(msg: ChatMessage): string {
    const isUser = msg.role === 'user'
    const time = msg.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })

    return `
      <div class="chat-msg chat-msg--${isUser ? 'user' : 'ai'}">
        <div class="chat-msg__avatar chat-msg__avatar--${isUser ? 'user' : 'ai'}">
          ${isUser ? '👤' : '🤖'}
        </div>
        <div class="chat-msg__content">
          <div class="chat-msg__bubble">${this.formatMessage(msg.content)}</div>
          <div class="chat-msg__time">${time}</div>
        </div>
      </div>
    `
  }

  private formatMessage(content: string): string {
    // Render code blocks: ```lang\ncode\n```
    return content
      .replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) => {
        const escaped = code
          .trim()
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        return `<pre style="background:var(--color-code-bg);color:var(--color-code-text);padding:var(--space-4);border-radius:var(--radius-md);margin:var(--space-2) 0;overflow-x:auto;font-family:var(--font-mono);font-size:0.8rem;line-height:1.6;"><code>${escaped}</code></pre>`
      })
      .replace(/`([^`]+)`/g, '<code style="background:var(--color-bg-secondary);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:0.9em;">$1</code>')
      .replace(/\n/g, '<br>')
  }

  private renderTyping(): string {
    return `
      <div class="chat-msg chat-msg--ai" id="typing-indicator">
        <div class="chat-msg__avatar chat-msg__avatar--ai">🤖</div>
        <div class="chat-msg__content">
          <div class="chat-msg__bubble">
            <div class="typing-indicator">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  private mountEvents(container: HTMLElement): void {
    const messagesEl = container.querySelector<HTMLElement>('#chat-messages')
    const input = container.querySelector<HTMLTextAreaElement>('#chat-input')
    const sendBtn = container.querySelector<HTMLButtonElement>('#chat-send')
    const clearBtn = container.querySelector<HTMLElement>('#agent-clear')
    const backBtn = container.querySelector<HTMLElement>('#agent-back')

    if (!messagesEl || !input || !sendBtn) return

    // Back button
    backBtn?.addEventListener('click', () => navigateTo('/'))

    // Clear button
    clearBtn?.addEventListener('click', () => {
      this.messages = []
      messagesEl.innerHTML = this.renderWelcome()
      this.mountSuggestions(messagesEl, input)
    })

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto'
      input.style.height = `${Math.min(input.scrollHeight, 120)}px`
    })

    // Suggestion buttons
    this.mountSuggestions(messagesEl, input)

    const submit = async () => {
      const text = input.value.trim()
      if (!text || this.isLoading) return

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      }

      this.messages.push(userMsg)
      this.isLoading = true
      input.value = ''
      input.style.height = 'auto'
      sendBtn.disabled = true

      // Clear welcome screen if first message
      if (this.messages.length === 1) {
        messagesEl.innerHTML = ''
      }

      messagesEl.insertAdjacentHTML('beforeend', this.renderMessage(userMsg))
      messagesEl.insertAdjacentHTML('beforeend', this.renderTyping())
      messagesEl.scrollTop = messagesEl.scrollHeight

      try {
        const history = this.messages.slice(-20).map(m => ({
          role: m.role,
          content: m.content,
        }))

        const reply = await sendChatMessage(history)

        document.getElementById('typing-indicator')?.remove()

        const aiMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        }

        this.messages.push(aiMsg)
        messagesEl.insertAdjacentHTML('beforeend', this.renderMessage(aiMsg))
      } catch (err) {
        document.getElementById('typing-indicator')?.remove()

        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `❌ Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}. Stelle sicher, dass der Server läuft und der API-Key gesetzt ist.`,
          timestamp: new Date(),
        }
        this.messages.push(errMsg)
        messagesEl.insertAdjacentHTML('beforeend', this.renderMessage(errMsg))
      } finally {
        this.isLoading = false
        sendBtn.disabled = false
        messagesEl.scrollTop = messagesEl.scrollHeight
        input.focus()
      }
    }

    sendBtn.addEventListener('click', submit)
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        submit()
      }
    })
  }

  private mountSuggestions(messagesEl: HTMLElement, input: HTMLTextAreaElement): void {
    messagesEl.querySelectorAll<HTMLElement>('[data-suggestion]').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset['suggestion'] ?? ''
        if (text) {
          input.value = text
          input.dispatchEvent(new Event('input'))
          input.focus()
        }
      })
    })
  }
}
