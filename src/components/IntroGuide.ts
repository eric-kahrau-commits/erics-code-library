const STORAGE_KEY = 'code-library-intro-seen'

interface Step {
  icon: string
  title: string
  description: string
  color: string
}

const STEPS: Step[] = [
  {
    icon: '👋',
    title: 'Willkommen in der Code Library!',
    description:
      'Dein persönliches Nachschlagewerk für HTML, CSS, JavaScript und TypeScript. Hier findest du alle wichtigen Befehle, Erklärungen und Codebeispiele – an einem Ort.',
    color: '#6c63ff',
  },
  {
    icon: '🔍',
    title: 'Intelligente Suche',
    description:
      'Tippe einfach ein Wort in die Suchleiste – z. B. „Bild" und du findest sofort den <img>-Tag. Die Suche versteht auch Synonyme und erkennt verwandte Begriffe.',
    color: '#10b981',
  },
  {
    icon: '📚',
    title: 'Vier Library-Sprachen',
    description:
      'Wähle in der Sidebar oder über die Buch-Karten eine Sprache: HTML, CSS, JavaScript oder TypeScript. Jede Seite zeigt die wichtigsten Konzepte mit Codebeispielen.',
    color: '#e34f26',
  },
  {
    icon: '📋',
    title: 'Code einfach kopieren',
    description:
      'Jedes Codebeispiel hat einen „Kopieren"-Button oben rechts. Ein Klick – schon ist der Code in deiner Zwischenablage und du kannst ihn direkt einfügen.',
    color: '#264de4',
  },
  {
    icon: '🤖',
    title: 'KI-Assistent fragen',
    description:
      'Du hast eine Frage zu einem Befehl? Klick auf „KI-Agent fragen" und stelle dem AI-Assistenten direkt deine Frage. Er antwortet auf Deutsch und gibt dir Code-Beispiele.',
    color: '#a855f7',
  },
]

export class IntroGuide {
  private currentStep = 0
  private visible = false

  shouldShow(): boolean {
    return !localStorage.getItem(STORAGE_KEY)
  }

  markSeen(): void {
    localStorage.setItem(STORAGE_KEY, '1')
  }

  show(): void {
    if (!this.shouldShow()) return
    this.visible = true
    this.currentStep = 0
    this.inject()
  }

  private inject(): void {
    const existing = document.getElementById('intro-guide-overlay')
    if (existing) existing.remove()

    const overlay = document.createElement('div')
    overlay.id = 'intro-guide-overlay'
    overlay.innerHTML = this.renderOverlay()
    document.body.appendChild(overlay)

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const modal = overlay.querySelector<HTMLElement>('.intro-guide__modal')
        if (modal) modal.style.opacity = '1'
        if (modal) modal.style.transform = 'scale(1) translateY(0)'
      })
    })

    this.mountEvents(overlay)
  }

  private renderOverlay(): string {
    return `
      <div class="intro-guide__backdrop" id="intro-backdrop"></div>
      <div class="intro-guide__modal" style="opacity:0; transform:scale(0.9) translateY(20px);">
        ${this.renderStep()}
      </div>
    `
  }

  private renderStep(): string {
    const step = STEPS[this.currentStep]!
    const isLast = this.currentStep === STEPS.length - 1
    const progress = ((this.currentStep + 1) / STEPS.length) * 100

    return `
      <div class="intro-guide__header" style="background: ${step.color}15; border-bottom: 2px solid ${step.color}30;">
        <div class="intro-guide__step-count">
          Schritt ${this.currentStep + 1} von ${STEPS.length}
        </div>
        <button class="intro-guide__skip" id="intro-skip">Überspringen</button>
      </div>

      <div class="intro-guide__body">
        <div class="intro-guide__icon" style="background: ${step.color}15; color: ${step.color}">
          ${step.icon}
        </div>
        <h2 class="intro-guide__title">${step.title}</h2>
        <p class="intro-guide__desc">${step.description}</p>
      </div>

      <div class="intro-guide__progress">
        <div class="intro-guide__progress-bar">
          <div class="intro-guide__progress-fill" style="width: ${progress}%; background: ${step.color};"></div>
        </div>
        <div class="intro-guide__dots">
          ${STEPS.map((_, i) => `
            <div class="intro-guide__dot ${i === this.currentStep ? 'is-active' : ''} ${i < this.currentStep ? 'is-done' : ''}"
                 style="${i === this.currentStep ? `background:${step.color}` : i < this.currentStep ? `background:${step.color}80` : ''}"
            ></div>
          `).join('')}
        </div>
      </div>

      <div class="intro-guide__footer">
        ${this.currentStep > 0 ? `
          <button class="intro-guide__btn intro-guide__btn--back" id="intro-back">
            ← Zurück
          </button>
        ` : '<div></div>'}

        <button
          class="intro-guide__btn intro-guide__btn--next"
          id="intro-next"
          style="background: ${step.color};"
        >
          ${isLast ? '🚀 Los geht\'s!' : 'Weiter →'}
        </button>
      </div>
    `
  }

  private mountEvents(overlay: HTMLElement): void {
    overlay.querySelector('#intro-skip')?.addEventListener('click', () => this.close(overlay))
    overlay.querySelector('#intro-backdrop')?.addEventListener('click', () => this.close(overlay))

    overlay.querySelector('#intro-next')?.addEventListener('click', () => {
      if (this.currentStep < STEPS.length - 1) {
        this.currentStep++
        this.updateStep(overlay)
      } else {
        this.close(overlay)
      }
    })

    overlay.querySelector('#intro-back')?.addEventListener('click', () => {
      if (this.currentStep > 0) {
        this.currentStep--
        this.updateStep(overlay)
      }
    })
  }

  private updateStep(overlay: HTMLElement): void {
    const modal = overlay.querySelector<HTMLElement>('.intro-guide__modal')
    if (!modal) return

    // Slide out
    modal.style.opacity = '0'
    modal.style.transform = 'scale(0.97) translateY(10px)'

    setTimeout(() => {
      modal.innerHTML = this.renderStep()
      modal.style.opacity = '1'
      modal.style.transform = 'scale(1) translateY(0)'
      this.mountEvents(overlay)
    }, 180)
  }

  private close(overlay: HTMLElement): void {
    const modal = overlay.querySelector<HTMLElement>('.intro-guide__modal')
    if (modal) {
      modal.style.opacity = '0'
      modal.style.transform = 'scale(0.95) translateY(10px)'
    }
    overlay.style.opacity = '0'
    setTimeout(() => {
      overlay.remove()
    }, 300)
    this.markSeen()
    this.visible = false
  }
}

export const introGuide = new IntroGuide()
