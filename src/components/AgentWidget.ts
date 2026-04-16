import { sendWidgetMessage } from '../utils/api.js'
import { navigateTo } from '../router.js'

interface WidgetMessage {
  role: 'user' | 'assistant'
  content: string
}

export class AgentWidget {
  private messages: WidgetMessage[] = [
    {
      role: 'assistant',
      content: 'Hallo! Ich bin dein KI-Assistent. Frag mich etwas über HTML, CSS, JavaScript oder TypeScript! 👋',
    },
  ]
  private isLoading = false
  private id = 'agent-widget'

  render(): string {
    return `
      <div class="agent-widget" id="${this.id}">
        <div class="agent-widget__header">
          <div class="agent-widget__title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            KI-Assistent
          </div>
          <div class="agent-widget__status">
            <div class="agent-widget__status-dot"></div>
            Online
          </div>
        </div>

        <div class="agent-widget__messages" id="${this.id}-messages">
          ${this.messages.map(m => this.renderMessage(m)).join('')}
        </div>

        <div class="agent-widget__input-wrap">
          <input
            type="text"
            class="agent-widget__input"
            placeholder="Frage stellen…"
            id="${this.id}-input"
          />
          <button class="agent-widget__send" id="${this.id}-send" aria-label="Senden">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>

        <div style="text-align:center; padding: 8px; border-top: 1px solid var(--color-border);">
          <button
            style="font-size:var(--text-xs); color:var(--color-primary); background:none; border:none; cursor:pointer; font-weight:600;"
            id="${this.id}-expand"
          >
            Vollbild-Chat öffnen →
          </button>
        </div>
      </div>
    `
  }

  private renderMessage(msg: WidgetMessage): string {
    return `
      <div class="agent-widget__msg agent-widget__msg--${msg.role === 'user' ? 'user' : 'ai'}">
        <div class="agent-widget__avatar agent-widget__avatar--${msg.role === 'user' ? 'user' : 'ai'}">
          ${msg.role === 'user' ? '👤' : '🤖'}
        </div>
        <div class="agent-widget__bubble">${msg.content}</div>
      </div>
    `
  }

  private renderTyping(): string {
    return `
      <div class="agent-widget__msg agent-widget__msg--ai" id="${this.id}-typing">
        <div class="agent-widget__avatar agent-widget__avatar--ai">🤖</div>
        <div class="agent-widget__bubble">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `
  }

  mount(container: HTMLElement): void {
    const widget = container.querySelector<HTMLElement>(`#${this.id}`)
    if (!widget) return

    const input = widget.querySelector<HTMLInputElement>(`#${this.id}-input`)
    const sendBtn = widget.querySelector<HTMLButtonElement>(`#${this.id}-send`)
    const messagesEl = widget.querySelector<HTMLElement>(`#${this.id}-messages`)
    const expandBtn = widget.querySelector<HTMLElement>(`#${this.id}-expand`)

    if (!input || !sendBtn || !messagesEl) return

    expandBtn?.addEventListener('click', () => navigateTo('/agent'))

    const submit = async () => {
      const text = input.value.trim()
      if (!text || this.isLoading) return

      this.isLoading = true
      input.value = ''
      sendBtn.disabled = true

      this.messages.push({ role: 'user', content: text })
      messagesEl.insertAdjacentHTML('beforeend', this.renderMessage({ role: 'user', content: text }))
      messagesEl.insertAdjacentHTML('beforeend', this.renderTyping())
      messagesEl.scrollTop = messagesEl.scrollHeight

      try {
        const reply = await sendWidgetMessage(text)
        widget.querySelector(`#${this.id}-typing`)?.remove()
        const aiMsg: WidgetMessage = { role: 'assistant', content: reply }
        this.messages.push(aiMsg)
        messagesEl.insertAdjacentHTML('beforeend', this.renderMessage(aiMsg))
      } catch {
        widget.querySelector(`#${this.id}-typing`)?.remove()
        const errMsg: WidgetMessage = {
          role: 'assistant',
          content: 'Entschuldigung, es gab einen Fehler. Stelle sicher, dass der API-Key in der .env Datei gesetzt ist.',
        }
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
      if (e.key === 'Enter') submit()
    })
  }
}
