import type { LibraryConfig } from '../types/index.js'
import { navigateTo } from '../router.js'

interface BookCardProps {
  library: LibraryConfig
  route: string
  animationDelay?: number
}

export class BookCard {
  private props: BookCardProps

  constructor(props: BookCardProps) {
    this.props = props
  }

  render(): string {
    const { library, route, animationDelay = 0 } = this.props

    return `
      <div
        class="book-card book-card--${library.id}"
        data-route="${route}"
        data-aos="fade-up"
        data-aos-delay="${animationDelay}"
        role="button"
        tabindex="0"
        aria-label="${library.label} Library öffnen"
      >
        <div class="book-card__spine"></div>
        <div class="book-card__content">
          <img
            src="${library.icon}"
            alt="${library.label} Logo"
            class="book-card__icon"
            loading="lazy"
            onerror="this.style.display='none'"
          />
          <div class="book-card__label">${library.label}</div>
          <div class="book-card__sublabel">${library.description}</div>
          <div class="book-card__count">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            ${library.entries.length} Einträge
          </div>
        </div>
        <div class="book-card__arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>
    `
  }

  mount(container: HTMLElement): void {
    const card = container.querySelector<HTMLElement>(`[data-route="${this.props.route}"]`)
    if (!card) return

    const nav = () => navigateTo(this.props.route)

    card.addEventListener('click', nav)
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        nav()
      }
    })
  }
}
