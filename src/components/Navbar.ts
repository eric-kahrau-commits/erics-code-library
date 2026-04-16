import type { LibraryId } from '../types/index.js'
import { navigateTo } from '../router.js'

interface NavbarOptions {
  activeLang?: LibraryId
}

const TABS: Array<{ id: LibraryId; label: string; route: string; color: string }> = [
  { id: 'html',       label: 'HTML',       route: '/html',  color: '#e34f26' },
  { id: 'css',        label: 'CSS',        route: '/css',   color: '#264de4' },
  { id: 'javascript', label: 'JS',         route: '/js',    color: '#b89b00' },
  { id: 'typescript', label: 'TS',         route: '/ts',    color: '#3178c6' },
  { id: 'c',          label: 'C',          route: '/c',     color: '#6b8da8' },
  { id: 'cpp',        label: 'C++',        route: '/cpp',   color: '#00599c' },
  { id: 'swift',      label: 'Swift',      route: '/swift', color: '#f05138' },
]

export class Navbar {
  private options: NavbarOptions

  constructor(options: NavbarOptions = {}) {
    this.options = options
  }

  render(): string {
    const { activeLang } = this.options

    return `
      <header class="navbar${activeLang ? ` lang-${activeLang}` : ''}">
        <a class="navbar__brand" href="#/" data-nav="/">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          Code Library
        </a>

        <div class="navbar__tabs">
          ${TABS.map(tab => `
            <button
              class="navbar__tab${tab.id === activeLang ? ` is-active lang-${tab.id}` : ''}"
              data-route="${tab.route}"
            >
              ${tab.label}
            </button>
          `).join('')}
        </div>

        <div class="navbar__actions">
          <button class="btn btn--primary btn--sm" data-route="/agent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Agent fragen
          </button>
        </div>
      </header>
    `
  }

  mount(container: HTMLElement): void {
    container.querySelectorAll<HTMLElement>('[data-route]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault()
        const route = el.dataset['route']
        if (route) navigateTo(route)
      })
    })

    container.querySelector<HTMLElement>('[data-nav="/"]')?.addEventListener('click', e => {
      e.preventDefault()
      navigateTo('/')
    })
  }
}
