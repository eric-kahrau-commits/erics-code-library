import type { LibraryConfig, LibraryEntry, SearchResult } from '../types/index.js'
import { Navbar } from '../components/Navbar.js'
import { SearchBar } from '../components/SearchBar.js'
import { navigateTo } from '../router.js'
import { scrollToElement } from '../utils/animations.js'
import { search } from '../utils/search.js'

// Simple, safe escape – no regex chains that could silently fail
function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Lightweight syntax colouring using simple string replacements
function colourCode(code: string, lang: string): string {
  const safe = esc(code)

  if (lang === 'html') {
    return safe
      // Comments
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span style="color:#6c7086;font-style:italic">$1</span>')
      // DOCTYPE
      .replace(/(&lt;!DOCTYPE[^>]*&gt;)/gi, '<span style="color:#cba6f7">$1</span>')
      // Closing/self-closing tags
      .replace(/(&lt;\/?)([\w-]+)/g, '$1<span style="color:#89dceb">$2</span>')
      // Attributes: name="value"
      .replace(/([\w-]+)(=)(&quot;[^&]*?&quot;)/g,
        '<span style="color:#f38ba8">$1</span>$2<span style="color:#a6e3a1">$3</span>')
  }

  if (lang === 'css') {
    return safe
      // Comments
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6c7086;font-style:italic">$1</span>')
      // Selectors (line ending with {)
      .replace(/^([^{}\n/][^{}\n]*?)(\s*\{)/gm, '<span style="color:#89dceb">$1</span>$2')
      // Properties
      .replace(/^(\s*)([\w-]+)(\s*:)/gm, '$1<span style="color:#89b4fa">$2</span>$3')
      // Hex colours
      .replace(/(#[0-9a-fA-F]{3,8})\b/g, '<span style="color:#a6e3a1">$1</span>')
      // Numbers with units
      .replace(/\b(\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms|fr)?)\b/g,
        '<span style="color:#fab387">$1</span>')
      // Strings
      .replace(/(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;)/g, '<span style="color:#a6e3a1">$1</span>')
  }

  if (lang === 'javascript' || lang === 'typescript') {
    const kw = ['const','let','var','function','return','if','else','for','while',
      'class','extends','new','this','import','export','default','from','async',
      'await','try','catch','finally','throw','typeof','instanceof','true','false',
      'null','undefined','void','static','type','interface','enum','readonly',
      'string','number','boolean','any','unknown','never']
    let out = safe
      // Single-line comments
      .replace(/(\/\/[^\n]*)/g, '<span style="color:#6c7086;font-style:italic">$1</span>')
      // Multi-line comments
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6c7086;font-style:italic">$1</span>')
      // Template literals (backtick strings – escaped as-is)
      .replace(/(`[^`]*`)/g, '<span style="color:#a6e3a1">$1</span>')
      // Regular strings
      .replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;)/g, '<span style="color:#a6e3a1">$1</span>')
    // Keywords
    const kwRe = new RegExp(`\\b(${kw.join('|')})\\b`, 'g')
    out = out.replace(kwRe, '<span style="color:#cba6f7">$1</span>')
    // Numbers
    out = out.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#fab387">$1</span>')
    return out
  }

  if (lang === 'c' || lang === 'cpp') {
    const kw = ['int','float','double','char','void','bool','long','short','unsigned',
      'signed','const','static','extern','auto','register','volatile','inline',
      'return','if','else','for','while','do','switch','case','break','continue',
      'default','struct','union','enum','typedef','sizeof','NULL','true','false',
      // C++ specific
      'class','public','private','protected','virtual','override','final',
      'new','delete','this','namespace','using','template','typename','throw',
      'try','catch','nullptr','explicit','operator','friend','mutable',
      'constexpr','decltype','auto','noexcept']
    let out = safe
      // Preprocessor directives
      .replace(/(#[\w]+[^\n]*)/g, '<span style="color:#cba6f7">$1</span>')
      // Single-line comments
      .replace(/(\/\/[^\n]*)/g, '<span style="color:#6c7086;font-style:italic">$1</span>')
      // Multi-line comments
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6c7086;font-style:italic">$1</span>')
      // Strings
      .replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;)/g, '<span style="color:#a6e3a1">$1</span>')
      // Char literals
      .replace(/(&#39;[^&#]*&#39;)/g, '<span style="color:#a6e3a1">$1</span>')
    // Keywords
    const kwRe = new RegExp(`\\b(${kw.join('|')})\\b`, 'g')
    out = out.replace(kwRe, '<span style="color:#89dceb">$1</span>')
    // Numbers (including hex, float suffixes)
    out = out.replace(/\b(\d+(?:\.\d+)?(?:[uUlLfF]*))\b/g, '<span style="color:#fab387">$1</span>')
    return out
  }

  if (lang === 'swift') {
    const kw = ['let','var','func','return','if','else','guard','for','in','while',
      'repeat','switch','case','break','continue','default','fallthrough',
      'class','struct','enum','protocol','extension','init','deinit','self','super',
      'import','typealias','associatedtype','where','is','as','try','throw','throws',
      'catch','do','defer','lazy','weak','unowned','mutating','nonmutating',
      'static','final','override','required','convenience','open','public',
      'internal','fileprivate','private','true','false','nil','inout',
      'subscript','operator','precedencegroup','String','Int','Double','Float',
      'Bool','Array','Dictionary','Set','Optional','Any','AnyObject','Void']
    let out = safe
      // Single-line comments
      .replace(/(\/\/[^\n]*)/g, '<span style="color:#6c7086;font-style:italic">$1</span>')
      // Multi-line comments
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6c7086;font-style:italic">$1</span>')
      // Strings (including escaped interpolation markers)
      .replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;)/g, '<span style="color:#a6e3a1">$1</span>')
    // Keywords
    const kwRe = new RegExp(`\\b(${kw.join('|')})\\b`, 'g')
    out = out.replace(kwRe, '<span style="color:#cba6f7">$1</span>')
    // Numbers
    out = out.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#fab387">$1</span>')
    // Attribute labels (e.g. @discardableResult)
    out = out.replace(/(@\w+)/g, '<span style="color:#f38ba8">$1</span>')
    return out
  }

  return safe
}

export class LibraryPage {
  private config: LibraryConfig

  constructor(config: LibraryConfig) {
    this.config = config
  }

  async render(): Promise<void> {
    const app = document.getElementById('app')
    if (!app) return

    const { config } = this
    const navbar = new Navbar({ activeLang: config.id })

    // ── 1. Set the skeleton HTML (no entry data yet) ───────────────────────
    app.innerHTML = `
      <aside class="lib-sidebar lang-${config.id}" id="lib-sidebar">
        <button class="lib-sidebar__back" id="lib-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Startseite
        </button>
        <div class="lib-sidebar__heading">
          <img src="${config.icon}" alt="${config.label}" width="24" height="24" onerror="this.style.display='none'">
          <span style="font-weight:700;font-size:var(--text-sm);color:var(--lang-color)">${config.label} Library</span>
        </div>
        <nav class="lib-sidebar__nav" id="lib-sidebar-nav"></nav>
      </aside>

      <div class="library-layout">
        ${navbar.render()}

        <div class="library-hero lang-${config.id}">
          <img src="${config.icon}" alt="${config.label} Logo" class="library-hero__img" onerror="this.style.display='none'">
          <div class="library-hero__text">
            <div class="library-hero__tag">${config.label}</div>
            <h1 class="library-hero__title">${config.label} Library</h1>
            <p class="library-hero__subtitle">
              ${config.description}<br>
              <strong>${config.entries.length} Einträge</strong> in ${config.categories.length} Kategorien.
            </p>
          </div>
        </div>

        <div class="library-search" id="lib-search-bar"></div>

        <div class="library-content" id="lib-entries"></div>
      </div>
    `

    // ── 2. Mount navbar ───────────────────────────────────────────────────
    navbar.mount(app)

    // ── 3. Mount search bar ───────────────────────────────────────────────
    const searchBarEl = document.getElementById('lib-search-bar')!
    const searchBar = new SearchBar({
      scope: config.id,
      placeholder: `${config.label} durchsuchen…`,
      onResult: (results) => this.applySearchResults(results),
    })
    searchBarEl.innerHTML = searchBar.render()
    searchBar.mount(searchBarEl)

    // ── 4. Populate sidebar nav ───────────────────────────────────────────
    this.populateSidebarNav()

    // ── 5. Render all entries into DOM ────────────────────────────────────
    this.renderAllEntries(config.entries)

    // ── 6. Wire up sidebar back button ────────────────────────────────────
    document.getElementById('lib-back')?.addEventListener('click', () => navigateTo('/'))

    window.scrollTo(0, 0)
  }

  // ── Sidebar nav ─────────────────────────────────────────────────────────────
  private populateSidebarNav(): void {
    const nav = document.getElementById('lib-sidebar-nav')
    if (!nav) return
    nav.innerHTML = ''

    const grouped = this.groupByCategory(this.config.entries)

    for (const cat of this.config.categories) {
      const catEntries = grouped[cat]
      if (!catEntries || catEntries.length === 0) continue

      const catLabel = document.createElement('div')
      catLabel.className = 'lib-sidebar__category'
      catLabel.textContent = cat
      nav.appendChild(catLabel)

      for (const entry of catEntries) {
        const btn = document.createElement('button')
        btn.className = 'lib-sidebar__item'
        btn.textContent = entry.name.length > 22 ? entry.name.slice(0, 22) + '…' : entry.name
        btn.dataset['entryId'] = entry.id
        btn.addEventListener('click', () => {
          scrollToElement(entry.id, 160)
          nav.querySelectorAll('.lib-sidebar__item').forEach(el => el.classList.remove('is-active'))
          btn.classList.add('is-active')
        })
        nav.appendChild(btn)
      }
    }
  }

  // ── Render all entries via DOM API (no innerHTML for user data) ─────────────
  private renderAllEntries(entries: LibraryEntry[]): void {
    const container = document.getElementById('lib-entries')
    if (!container) return
    container.innerHTML = ''

    const grouped = this.groupByCategory(entries)

    for (const cat of this.config.categories) {
      const catEntries = grouped[cat]
      if (!catEntries || catEntries.length === 0) continue

      // Section wrapper
      const section = document.createElement('section')
      section.className = `library-section lang-${this.config.id}`
      section.id = `section-${this.slugify(cat)}`

      // Section title
      const title = document.createElement('h2')
      title.className = 'library-section__title'
      title.textContent = cat
      section.appendChild(title)

      // Entries grid
      const grid = document.createElement('div')
      grid.className = 'entries-grid'

      catEntries.forEach((entry, i) => {
        const card = this.buildEntryCard(entry, i)
        grid.appendChild(card)
      })

      section.appendChild(grid)
      container.appendChild(section)
    }

    if (container.children.length === 0) {
      const empty = document.createElement('p')
      empty.style.cssText = 'padding: 2rem; color: var(--color-text-muted); text-align:center;'
      empty.textContent = 'Keine Einträge gefunden.'
      container.appendChild(empty)
    }
  }

  // ── Build one entry card as a real DOM element ──────────────────────────────
  private buildEntryCard(entry: LibraryEntry, index: number): HTMLElement {
    const { config } = this

    const card = document.createElement('div')
    card.className = `entry-card lang-${config.id}`
    card.id = entry.id
    card.style.animationDelay = `${Math.min(index * 40, 300)}ms`
    card.classList.add('entry-card--animate')

    // Header
    const header = document.createElement('div')
    header.className = 'entry-card__header'
    header.innerHTML = `
      <div class="entry-card__title-wrap">
        <div class="entry-card__icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </div>
        <div>
          <div class="entry-card__name"></div>
          <div class="entry-card__category"></div>
        </div>
      </div>
      <span class="badge badge--${config.id}"></span>
    `
    header.querySelector<HTMLElement>('.entry-card__name')!.textContent = entry.name
    header.querySelector<HTMLElement>('.entry-card__category')!.textContent = entry.category
    header.querySelector<HTMLElement>(`.badge`)!.textContent = config.label
    card.appendChild(header)

    // Description
    const desc = document.createElement('p')
    desc.className = 'entry-card__desc'
    desc.textContent = entry.description
    card.appendChild(desc)

    // Code block
    const codeWrap = document.createElement('div')
    codeWrap.className = 'entry-card__code'
    codeWrap.appendChild(this.buildCodeBlock(entry.syntax, config.id))
    card.appendChild(codeWrap)

    return card
  }

  // ── Build code block as DOM element ────────────────────────────────────────
  private buildCodeBlock(code: string, lang: string): HTMLElement {
    const block = document.createElement('div')
    block.className = 'code-block'

    // Header bar
    const headerEl = document.createElement('div')
    headerEl.className = 'code-block__header'
    headerEl.innerHTML = `
      <div class="code-block__dots">
        <span class="code-block__dot code-block__dot--red"></span>
        <span class="code-block__dot code-block__dot--yellow"></span>
        <span class="code-block__dot code-block__dot--green"></span>
      </div>
      <span class="code-block__label">${lang.toUpperCase()}</span>
      <button class="code-block__copy">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        Kopieren
      </button>
    `

    // Wire up copy button
    const copyBtn = headerEl.querySelector<HTMLButtonElement>('.code-block__copy')!
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code)
        const orig = copyBtn.innerHTML
        copyBtn.classList.add('is-copied')
        copyBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Kopiert!`
        setTimeout(() => {
          copyBtn.classList.remove('is-copied')
          copyBtn.innerHTML = orig
        }, 2000)
      } catch { /* silent */ }
    })

    block.appendChild(headerEl)

    // Code body
    const body = document.createElement('div')
    body.className = 'code-block__body'

    const pre = document.createElement('pre')
    pre.className = 'code-block__pre'

    const codeEl = document.createElement('code')
    // Safe: use innerHTML only for the coloured output of our own controlled function
    codeEl.innerHTML = colourCode(code, lang)

    pre.appendChild(codeEl)
    body.appendChild(pre)
    block.appendChild(body)

    return block
  }

  // ── Search results ──────────────────────────────────────────────────────────
  private applySearchResults(results: SearchResult[]): void {
    const entries = results.length === 0
      ? this.config.entries
      : results.map(r => r.item)

    this.renderAllEntries(entries)

    if (results.length > 0) {
      const container = document.getElementById('lib-entries')
      if (container) {
        const banner = document.createElement('div')
        banner.style.cssText = `
          padding: var(--space-3) var(--space-6);
          background: var(--lang-light, var(--color-primary-light));
          color: var(--lang-color, var(--color-primary));
          font-size: var(--text-sm);
          font-weight: 600;
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
        `
        banner.textContent = `🔍 ${results.length} Ergebnis${results.length !== 1 ? 'se' : ''} gefunden`
        container.prepend(banner)
      }
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  private groupByCategory(entries: LibraryEntry[]): Record<string, LibraryEntry[]> {
    const result: Record<string, LibraryEntry[]> = {}
    for (const entry of entries) {
      if (!result[entry.category]) result[entry.category] = []
      result[entry.category]!.push(entry)
    }
    return result
  }

  private slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
}
