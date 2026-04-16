import type { RouteId } from './types/index.js'

type RouteHandler = () => Promise<void>

interface RouteDefinition {
  id: RouteId
  handler: RouteHandler
  title: string
}

class Router {
  private routes = new Map<string, RouteDefinition>()
  private currentRoute: string = '/'
  private onNavigateCallbacks: Array<(route: string) => void> = []

  register(path: string, def: RouteDefinition): void {
    this.routes.set(path, def)
  }

  onNavigate(cb: (route: string) => void): void {
    this.onNavigateCallbacks.push(cb)
  }

  async navigate(path: string, pushState = true): Promise<void> {
    // Normalize path
    const normalized = path.startsWith('/') ? path : `/${path}`
    const route = this.routes.get(normalized) ?? this.routes.get('/')

    if (!route) return

    this.currentRoute = normalized
    document.title = `${route.title} | Code Library`

    if (pushState) {
      window.location.hash = normalized
    }

    this.onNavigateCallbacks.forEach(cb => cb(normalized))

    try {
      await route.handler()
    } catch (err) {
      console.error(`[Router] Error rendering route "${normalized}":`, err)
    }
  }

  getCurrentRoute(): string {
    return this.currentRoute
  }

  init(): void {
    // Handle hash changes
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1) || '/'
      this.navigate(hash, false)
    })

    // Handle initial load
    const initial = window.location.hash.slice(1) || '/'
    this.navigate(initial, false)
  }
}

export const router = new Router()

export function navigateTo(path: string): void {
  router.navigate(path)
}
