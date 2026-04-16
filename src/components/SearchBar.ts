import type { LibraryId, SearchResult } from '../types/index.js'
import { search } from '../utils/search.js'
import { debounce } from '../utils/animations.js'
import { navigateTo } from '../router.js'

interface SearchBarOptions {
  scope: LibraryId | 'all'
  placeholder?: string
  large?: boolean
  onResult?: (results: SearchResult[]) => void
}

export class SearchBar {
  private options: SearchBarOptions
  private id: string

  constructor(options: SearchBarOptions) {
    this.options = options
    this.id = `search-${Math.random().toString(36).slice(2, 8)}`
  }

  render(): string {
    const { placeholder = 'Suchen… z.B. Bild, Flexbox, async', large = false } = this.options
    const inputClass = large ? 'search-bar__input search-bar__input--lg' : 'search-bar__input'

    return `
      <div class="search-bar" id="${this.id}">
        <div class="search-bar__input-wrap">
          <span class="search-bar__icon">
            <svg width="${large ? 22 : 18}" height="${large ? 22 : 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="search"
            class="${inputClass}"
            placeholder="${placeholder}"
            autocomplete="off"
            spellcheck="false"
            data-search-input
          />
          <button class="search-bar__clear" data-clear-btn aria-label="Suche leeren">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="search-bar__results" data-results></div>
      </div>
    `
  }

  mount(container: HTMLElement): void {
    const root = container.querySelector<HTMLElement>(`#${this.id}`)
    if (!root) return

    const input = root.querySelector<HTMLInputElement>('[data-search-input]')
    const clearBtn = root.querySelector<HTMLElement>('[data-clear-btn]')
    const resultsEl = root.querySelector<HTMLElement>('[data-results]')

    if (!input || !clearBtn || !resultsEl) return

    const handleSearch = debounce((term: string) => {
      if (!term.trim()) {
        this.closeResults(resultsEl, clearBtn)
        this.options.onResult?.([])
        return
      }

      const results = search(term, this.options.scope)
      this.options.onResult?.(results)

      if (this.options.scope === 'all') {
        this.renderDropdown(results, resultsEl)
      }

      clearBtn.classList.toggle('is-visible', term.length > 0)
    }, 200)

    input.addEventListener('input', e => {
      handleSearch((e.target as HTMLInputElement).value)
    })

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        input.value = ''
        this.closeResults(resultsEl, clearBtn)
        this.options.onResult?.([])
      }
    })

    clearBtn.addEventListener('click', () => {
      input.value = ''
      input.focus()
      this.closeResults(resultsEl, clearBtn)
      this.options.onResult?.([])
    })

    document.addEventListener('click', e => {
      if (!root.contains(e.target as Node)) {
        this.closeResults(resultsEl, clearBtn)
      }
    })
  }

  private closeResults(resultsEl: HTMLElement, clearBtn: HTMLElement): void {
    resultsEl.classList.remove('is-open')
    clearBtn.classList.remove('is-visible')
  }

  private renderDropdown(results: SearchResult[], container: HTMLElement): void {
    if (results.length === 0) {
      container.innerHTML = `<div class="search-bar__empty">Keine Ergebnisse gefunden.</div>`
      container.classList.add('is-open')
      return
    }

    const routeMap: Record<string, string> = {
      html: '/html',
      css: '/css',
      javascript: '/js',
      typescript: '/ts',
    }

    const labelMap: Record<string, string> = {
      html: 'HTML',
      css: 'CSS',
      javascript: 'JS',
      typescript: 'TS',
    }

    container.innerHTML = results
      .slice(0, 8)
      .map(
        r => `
          <div
            class="search-bar__result-item"
            data-route="${routeMap[r.item.language]}"
            data-entry="${r.item.id}"
          >
            <span class="badge badge--${r.item.language} search-bar__result-badge">
              ${labelMap[r.item.language]}
            </span>
            <div>
              <div class="search-bar__result-name">${r.item.name}</div>
              <div class="search-bar__result-desc">${r.item.description.slice(0, 80)}…</div>
            </div>
          </div>
        `,
      )
      .join('')

    container.classList.add('is-open')

    container.querySelectorAll<HTMLElement>('[data-route]').forEach(el => {
      el.addEventListener('click', () => {
        const route = el.dataset['route']
        if (route) navigateTo(route)
        container.classList.remove('is-open')
      })
    })
  }
}
