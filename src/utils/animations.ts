interface AOSInstance {
  refresh(): void
  refreshHard(): void
}

let _aos: AOSInstance | null = null

export function setAOSInstance(instance: AOSInstance): void {
  _aos = instance
}

export function refreshAOS(): void {
  _aos?.refresh()
}

export function refreshAOSHard(): void {
  _aos?.refreshHard()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function scrollToElement(id: string, offset = 80): void {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: 'smooth' })
}

export function observeActiveSection(
  sectionIds: string[],
  onChange: (activeId: string) => void,
): () => void {
  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          onChange(entry.target.id)
          break
        }
      }
    },
    { threshold: 0.3 },
  )

  for (const id of sectionIds) {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }

  return () => observer.disconnect()
}

export function animateCounter(
  el: HTMLElement,
  target: number,
  duration = 1000,
): void {
  const start = performance.now()
  const update = (now: number) => {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    el.textContent = Math.round(eased * target).toString()
    if (progress < 1) requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}
