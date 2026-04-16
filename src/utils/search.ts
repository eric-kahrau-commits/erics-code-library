import Fuse, { type IFuseOptions } from 'fuse.js'
import type { LibraryEntry, LibraryId, SearchResult } from '../types/index.js'
import { htmlConfig } from '../data/html.data.js'
import { cssConfig } from '../data/css.data.js'
import { jsConfig } from '../data/javascript.data.js'
import { tsConfig } from '../data/typescript.data.js'
import { cConfig } from '../data/c.data.js'
import { cppConfig } from '../data/cpp.data.js'
import { swiftConfig } from '../data/swift.data.js'

const fuseOptions: IFuseOptions<LibraryEntry> = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'tags', weight: 0.3 },
    { name: 'description', weight: 0.2 },
    { name: 'category', weight: 0.1 },
  ],
  threshold: 0.38,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
}

const allEntries = [
  ...htmlConfig.entries,
  ...cssConfig.entries,
  ...jsConfig.entries,
  ...tsConfig.entries,
  ...cConfig.entries,
  ...cppConfig.entries,
  ...swiftConfig.entries,
]

const globalIndex = new Fuse(allEntries, fuseOptions)
const htmlIndex  = new Fuse(htmlConfig.entries, fuseOptions)
const cssIndex   = new Fuse(cssConfig.entries, fuseOptions)
const jsIndex    = new Fuse(jsConfig.entries, fuseOptions)
const tsIndex    = new Fuse(tsConfig.entries, fuseOptions)
const cIndex     = new Fuse(cConfig.entries, fuseOptions)
const cppIndex   = new Fuse(cppConfig.entries, fuseOptions)
const swiftIndex = new Fuse(swiftConfig.entries, fuseOptions)

const indexMap: Record<LibraryId, Fuse<LibraryEntry>> = {
  html:       htmlIndex,
  css:        cssIndex,
  javascript: jsIndex,
  typescript: tsIndex,
  c:          cIndex,
  cpp:        cppIndex,
  swift:      swiftIndex,
}

export function search(term: string, scope: LibraryId | 'all' = 'all'): SearchResult[] {
  if (!term.trim()) return []

  const index = scope === 'all' ? globalIndex : indexMap[scope]
  const raw = index.search(term)

  return raw
    .filter(r => (r.score ?? 1) < 0.38)
    .slice(0, 20)
    .map(r => ({
      item: r.item,
      score: r.score ?? 0,
      refIndex: r.refIndex,
    }))
}

export function getLibraryEntries(id: LibraryId): LibraryEntry[] {
  return {
    html:       htmlConfig.entries,
    css:        cssConfig.entries,
    javascript: jsConfig.entries,
    typescript: tsConfig.entries,
    c:          cConfig.entries,
    cpp:        cppConfig.entries,
    swift:      swiftConfig.entries,
  }[id]
}
