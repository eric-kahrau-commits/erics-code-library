import { navigateTo, router } from '../router.js'

const NAV_ITEMS = [
  {
    label: 'Web',
    links: [
      { label: 'HTML', route: '/html', dot: '#e34f26' },
      { label: 'CSS', route: '/css', dot: '#264de4' },
      { label: 'JavaScript', route: '/js', dot: '#b89b00' },
      { label: 'TypeScript', route: '/ts', dot: '#3178c6' },
    ],
  },
  {
    label: 'Systems & Mobile',
    links: [
      { label: 'C', route: '/c', dot: '#6b8da8' },
      { label: 'C++', route: '/cpp', dot: '#00599c' },
      { label: 'Swift', route: '/swift', dot: '#f05138' },
    ],
  },
]

export class Sidebar {
  render(): string {
    return `
      <aside class="sidebar" id="main-sidebar">
        <a class="sidebar__logo" href="#/" data-nav="/">
          <div class="sidebar__logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          <div>
            <div class="sidebar__logo-text">Code Library</div>
            <div class="sidebar__logo-sub">Schul-Nachschlagewerk</div>
          </div>
        </a>

        <nav class="sidebar__nav">
          <a class="sidebar__link" href="#/" data-nav="/">
            <span class="sidebar__link-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </span>
            Startseite
          </a>

          <div class="sidebar__divider"></div>

          ${NAV_ITEMS.map(section => `
            <div class="sidebar__section-title">${section.label}</div>
            ${section.links.map(link => `
              <a class="sidebar__link" href="#${link.route}" data-nav="${link.route}">
                <span class="sidebar__link-dot" style="background:${link.dot}"></span>
                ${link.label}
              </a>
            `).join('')}
          `).join('')}
        </nav>

        <div class="sidebar__footer">
          <button class="sidebar__agent-btn" data-nav="/agent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            KI-Agent fragen
          </button>
        </div>
      </aside>
    `
  }

  mount(container: HTMLElement): void {
    const sidebar = container.querySelector<HTMLElement>('#main-sidebar')
    if (!sidebar) return

    const updateActive = (route: string) => {
      sidebar.querySelectorAll<HTMLElement>('[data-nav]').forEach(el => {
        const target = el.dataset['nav'] ?? ''
        el.classList.toggle('is-active', target === route)
      })
    }

    sidebar.querySelectorAll<HTMLElement>('[data-nav]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault()
        const route = el.dataset['nav'] ?? '/'
        navigateTo(route)
      })
    })

    router.onNavigate(updateActive)
    updateActive(router.getCurrentRoute())
  }
}
