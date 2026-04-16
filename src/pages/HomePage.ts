import { Sidebar } from '../components/Sidebar.js'
import { SearchBar } from '../components/SearchBar.js'
import { BookCard } from '../components/BookCard.js'
import { htmlConfig } from '../data/html.data.js'
import { cssConfig } from '../data/css.data.js'
import { jsConfig } from '../data/javascript.data.js'
import { tsConfig } from '../data/typescript.data.js'
import { cConfig } from '../data/c.data.js'
import { cppConfig } from '../data/cpp.data.js'
import { swiftConfig } from '../data/swift.data.js'
import { navigateTo } from '../router.js'
import { refreshAOSHard } from '../utils/animations.js'

const WEB_BOOKS = [
  { config: htmlConfig, route: '/html' },
  { config: cssConfig, route: '/css' },
  { config: jsConfig, route: '/js' },
  { config: tsConfig, route: '/ts' },
]

const SYSTEMS_BOOKS = [
  { config: cConfig, route: '/c' },
  { config: cppConfig, route: '/cpp' },
  { config: swiftConfig, route: '/swift' },
]

const ALL_BOOKS = [...WEB_BOOKS, ...SYSTEMS_BOOKS]

const LANGS = [
  { label: 'HTML',       cls: 'html',  dot: '#e34f26' },
  { label: 'CSS',        cls: 'css',   dot: '#264de4' },
  { label: 'JavaScript', cls: 'js',    dot: '#f7df1e' },
  { label: 'TypeScript', cls: 'ts',    dot: '#3178c6' },
  { label: 'C',          cls: 'c',     dot: '#6b8da8' },
  { label: 'C++',        cls: 'cpp',   dot: '#00599c' },
  { label: 'Swift',      cls: 'swift', dot: '#f05138' },
]

export class HomePage {
  async render(): Promise<void> {
    const app = document.getElementById('app')
    if (!app) return

    const sidebar = new Sidebar()
    const searchBar = new SearchBar({ scope: 'all', large: true })

    const webCards = WEB_BOOKS.map(
      (b, i) => new BookCard({ library: b.config, route: b.route, animationDelay: i * 80 }),
    )
    const systemsCards = SYSTEMS_BOOKS.map(
      (b, i) => new BookCard({ library: b.config, route: b.route, animationDelay: i * 80 }),
    )

    const totalEntries = ALL_BOOKS.reduce((sum, b) => sum + b.config.entries.length, 0)
    const totalCategories = ALL_BOOKS.reduce((sum, b) => sum + b.config.categories.length, 0)

    app.innerHTML = `
      ${sidebar.render()}

      <div class="home-layout">

        <!-- ── Hero ──────────────────────────────────────────────────────── -->
        <section class="home-hero">
          <!-- Background orbs -->
          <div class="home-hero__bg" aria-hidden="true">
            <div class="home-hero__orb home-hero__orb--1"></div>
            <div class="home-hero__orb home-hero__orb--2"></div>
            <div class="home-hero__orb home-hero__orb--3"></div>
            <div class="home-hero__orb home-hero__orb--4"></div>
          </div>

          <div class="home-hero__inner">
            <div data-aos="fade-down">
              <div class="home-hero__eyebrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                Dein persönliches Nachschlagewerk
              </div>
              <h1 class="home-hero__title">
                Erics <span>Code Library</span>
              </h1>
              <p class="home-hero__subtitle">
                HTML, CSS, JavaScript, TypeScript, C, C++ und Swift –
                alle wichtigen Befehle und Code-Beispiele an einem Ort.
              </p>

              <!-- Language badges -->
              <div class="home-hero__langs">
                ${LANGS.map(l => `
                  <span class="home-hero__lang home-hero__lang--${l.cls}">
                    <span class="home-hero__lang-dot" style="background:${l.dot}"></span>
                    ${l.label}
                  </span>
                `).join('')}
              </div>
            </div>

            <!-- Search bar -->
            <div class="home-hero__search" data-aos="fade-up" data-aos-delay="150">
              ${searchBar.render()}
            </div>

            <!-- Stats -->
            <div class="home-hero__stats" data-aos="fade-up" data-aos-delay="250">
              <div class="home-hero__stat">
                <div class="home-hero__stat-value">${totalEntries}</div>
                <div class="home-hero__stat-label">Einträge</div>
              </div>
              <div class="home-hero__stat">
                <div class="home-hero__stat-value">7</div>
                <div class="home-hero__stat-label">Sprachen</div>
              </div>
              <div class="home-hero__stat">
                <div class="home-hero__stat-value">${totalCategories}</div>
                <div class="home-hero__stat-label">Kategorien</div>
              </div>
              <div class="home-hero__stat">
                <div class="home-hero__stat-value">∞</div>
                <div class="home-hero__stat-label">Möglichkeiten</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── Main Content ───────────────────────────────────────────────── -->
        <main class="home-content">

          <!-- Libraries -->
          <div class="home-section" data-aos="fade-up">
            <div class="home-section__header">
              <div>
                <h2 class="home-section__title">Bibliotheken</h2>
                <p class="home-section__subtitle">Klick auf eine Karte, um die Library zu öffnen</p>
              </div>
            </div>

            <!-- Web Group -->
            <div class="books-group">
              <div class="books-group__header">
                <span class="books-group__label">Web-Technologien</span>
                <span class="books-group__count">4 Bibliotheken</span>
              </div>
              <div class="books-grid">
                ${webCards.map(card => card.render()).join('')}
              </div>
            </div>

            <!-- Systems Group -->
            <div class="books-group">
              <div class="books-group__header">
                <span class="books-group__label">Systems &amp; Mobile</span>
                <span class="books-group__count">3 Bibliotheken</span>
              </div>
              <div class="books-grid">
                ${systemsCards.map(card => card.render()).join('')}
              </div>
            </div>
          </div>

          <!-- AI Agent Banner -->
          <div class="home-agent-banner" data-aos="fade-up" id="agent-banner">
            <div class="home-agent-banner__left">
              <div class="home-agent-banner__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 8V4H8"></path>
                  <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                  <path d="M2 14h2"></path>
                  <path d="M20 14h2"></path>
                  <path d="M15 13v2"></path>
                  <path d="M9 13v2"></path>
                </svg>
              </div>
              <div>
                <h3 class="home-agent-banner__title">KI-Assistent</h3>
                <p class="home-agent-banner__desc">
                  Frag unseren KI-Assistenten direkt nach Code-Erklärungen,
                  Beispielen oder Fehlerbehebung – er antwortet auf Deutsch.
                </p>
              </div>
            </div>
            <button class="home-agent-banner__btn" id="go-to-agent">
              Agent fragen
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          <!-- Tips Grid -->
          <div class="home-section" data-aos="fade-up" data-aos-delay="100">
            <div class="home-section__header">
              <div>
                <h2 class="home-section__title">So nutzt du die Library</h2>
                <p class="home-section__subtitle">4 schnelle Wege, effizienter zu lernen</p>
              </div>
            </div>
            <div class="home-tips-grid">
              ${[
                {
                  icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
                  title: 'Intelligente Suche',
                  desc: 'Tippe z.&nbsp;B. „Bild" und finde sofort den HTML &lt;img&gt;-Tag oder „Pointer" für C-Zeiger.',
                },
                {
                  icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
                  title: 'Code kopieren',
                  desc: 'Jedes Beispiel hat einen „Kopieren"-Button. Einfach klicken – direkt in der Zwischenablage.',
                },
                {
                  icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
                  title: 'Direkt navigieren',
                  desc: 'Die Sidebar jeder Library zeigt alle Kategorien – springe direkt zum gesuchten Thema.',
                },
                {
                  icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>`,
                  title: 'KI fragen',
                  desc: 'Du verstehst einen Befehl nicht? Der KI-Assistent erklärt ihn dir auf Deutsch mit Beispielen.',
                },
              ].map(tip => `
                <div class="home-tip-card">
                  <span class="home-tip-card__icon">${tip.icon}</span>
                  <h4 class="home-tip-card__title">${tip.title}</h4>
                  <p class="home-tip-card__desc">${tip.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>

        </main>
      </div>
    `

    // Mount components
    sidebar.mount(app)
    searchBar.mount(app)
    webCards.forEach(card => card.mount(app))
    systemsCards.forEach(card => card.mount(app))

    document.getElementById('go-to-agent')?.addEventListener('click', () => navigateTo('/agent'))

    refreshAOSHard()
  }
}
