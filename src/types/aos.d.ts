declare module 'aos' {
  interface AosOptions {
    duration?: number
    easing?: string
    once?: boolean
    offset?: number
    delay?: number
    anchor?: string
    placement?: string
  }

  interface Aos {
    init(options?: AosOptions): void
    refresh(): void
    refreshHard(): void
  }

  const aos: Aos
  export default aos
}
