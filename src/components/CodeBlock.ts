import type { CodeBlockOptions } from '../types/index.js'
import { highlight } from '../utils/highlight.js'
import { copyToClipboard, showCopyFeedback } from '../utils/clipboard.js'

export class CodeBlock {
  private options: CodeBlockOptions

  constructor(options: CodeBlockOptions) {
    this.options = options
  }

  render(): string {
    const { code, language, label } = this.options
    const displayLabel = label ?? language.toUpperCase()
    const highlighted = highlight(code, language)

    return `
      <div class="code-block">
        <div class="code-block__header">
          <div class="code-block__dots">
            <span class="code-block__dot code-block__dot--red"></span>
            <span class="code-block__dot code-block__dot--yellow"></span>
            <span class="code-block__dot code-block__dot--green"></span>
          </div>
          <span class="code-block__label">${displayLabel}</span>
          <button class="code-block__copy" data-copy-btn>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Kopieren
          </button>
        </div>
        <div class="code-block__body">
          <pre class="code-block__pre"><code>${highlighted}</code></pre>
        </div>
      </div>
    `
  }

  mount(container: HTMLElement): void {
    const btn = container.querySelector<HTMLElement>('[data-copy-btn]')
    if (!btn) return

    btn.addEventListener('click', async () => {
      const success = await copyToClipboard(this.options.code)
      if (success) {
        showCopyFeedback(btn)
      }
    })
  }
}
