import './styles/globals.css'
import './styles/animations.css'
import './styles/components.css'
import { router } from './router.js'
import { HomePage } from './pages/HomePage.js'
import { LibraryPage } from './pages/LibraryPage.js'
import { AgentPage } from './pages/AgentPage.js'
import { htmlConfig } from './data/html.data.js'
import { cssConfig } from './data/css.data.js'
import { jsConfig } from './data/javascript.data.js'
import { tsConfig } from './data/typescript.data.js'
import { cConfig } from './data/c.data.js'
import { cppConfig } from './data/cpp.data.js'
import { swiftConfig } from './data/swift.data.js'
import { setAOSInstance } from './utils/animations.js'
import { introGuide } from './components/IntroGuide.js'

// Initialize AOS
async function initAOS() {
  const AOS = (await import('aos')).default
  AOS.init({
    duration: 600,
    easing: 'ease-out-cubic',
    once: false,
    offset: 40,
  })
  setAOSInstance(AOS)
}

// Register routes
router.register('/', {
  id: '/',
  title: 'Home',
  handler: async () => {
    const page = new HomePage()
    await page.render()
  },
})

router.register('/html', {
  id: '/html',
  title: 'HTML Library',
  handler: async () => {
    const page = new LibraryPage(htmlConfig)
    await page.render()
  },
})

router.register('/css', {
  id: '/css',
  title: 'CSS Library',
  handler: async () => {
    const page = new LibraryPage(cssConfig)
    await page.render()
  },
})

router.register('/js', {
  id: '/js',
  title: 'JavaScript Library',
  handler: async () => {
    const page = new LibraryPage(jsConfig)
    await page.render()
  },
})

router.register('/ts', {
  id: '/ts',
  title: 'TypeScript Library',
  handler: async () => {
    const page = new LibraryPage(tsConfig)
    await page.render()
  },
})

router.register('/c', {
  id: '/c',
  title: 'C Library',
  handler: async () => {
    const page = new LibraryPage(cConfig)
    await page.render()
  },
})

router.register('/cpp', {
  id: '/cpp',
  title: 'C++ Library',
  handler: async () => {
    const page = new LibraryPage(cppConfig)
    await page.render()
  },
})

router.register('/swift', {
  id: '/swift',
  title: 'Swift Library',
  handler: async () => {
    const page = new LibraryPage(swiftConfig)
    await page.render()
  },
})

router.register('/agent', {
  id: '/agent',
  title: 'KI-Agent',
  handler: async () => {
    const page = new AgentPage()
    await page.render()
  },
})

// Boot
async function boot() {
  await initAOS()
  router.init()
  // Show intro guide on first visit (slight delay so page renders first)
  setTimeout(() => introGuide.show(), 600)
}

boot()
