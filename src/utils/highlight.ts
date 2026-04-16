import type { LibraryId } from '../types/index.js'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function highlightHtml(code: string): string {
  let escaped = escapeHtml(code)

  // Comments
  escaped = escaped.replace(
    /(&lt;!--[\s\S]*?--&gt;)/g,
    '<span class="hl-comment">$1</span>',
  )

  // DOCTYPE
  escaped = escaped.replace(
    /(&lt;!DOCTYPE[^&]*&gt;)/gi,
    '<span class="hl-keyword">$1</span>',
  )

  // Tags with attributes
  escaped = escaped.replace(
    /(&lt;\/?)([\w-]+)((?:[^&]|&(?!gt;))*?)(\s*\/?)(&gt;)/g,
    (_, open, tag, attrs, selfClose, close) => {
      const coloredAttrs = attrs.replace(
        /([\w-]+)(\s*=\s*)(&quot;[^&quot;]*&quot;)/g,
        '<span class="hl-attr">$1</span>$2<span class="hl-value">$3</span>',
      )
      return `${open}<span class="hl-tag">${tag}</span>${coloredAttrs}${selfClose}${close}`
    },
  )

  return escaped
}

function highlightCss(code: string): string {
  let escaped = escapeHtml(code)

  // Comments
  escaped = escaped.replace(
    /(\/\*[\s\S]*?\*\/)/g,
    '<span class="hl-comment">$1</span>',
  )

  // Selectors (lines ending with {)
  escaped = escaped.replace(
    /^([^{}\n/][^{}\n]*?)(\s*\{)/gm,
    '<span class="hl-tag">$1</span>$2',
  )

  // Properties
  escaped = escaped.replace(
    /^\s*([\w-]+)(\s*:)/gm,
    '  <span class="hl-property">$1</span>$2',
  )

  // Values (strings)
  escaped = escaped.replace(
    /(&quot;[^&quot;]*&quot;|&#39;[^&#39;]*&#39;)/g,
    '<span class="hl-string">$1</span>',
  )

  // Numbers with units
  escaped = escaped.replace(
    /\b(\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|deg|s|ms|fr)?)\b/g,
    '<span class="hl-number">$1</span>',
  )

  // Hex colors
  escaped = escaped.replace(
    /(#[0-9a-fA-F]{3,8})\b/g,
    '<span class="hl-string">$1</span>',
  )

  return escaped
}

function highlightJs(code: string): string {
  let escaped = escapeHtml(code)

  // Comments (single-line)
  escaped = escaped.replace(
    /(\/\/[^\n]*)/g,
    '<span class="hl-comment">$1</span>',
  )

  // Comments (multi-line)
  escaped = escaped.replace(
    /(\/\*[\s\S]*?\*\/)/g,
    '<span class="hl-comment">$1</span>',
  )

  // Template literals
  escaped = escaped.replace(
    /(`[^`]*`)/g,
    '<span class="hl-string">$1</span>',
  )

  // Strings
  escaped = escaped.replace(
    /(&quot;(?:[^&]|&(?!quot;))*?&quot;|&#39;[^&#39;]*?&#39;)/g,
    '<span class="hl-string">$1</span>',
  )

  // Keywords
  const keywords = [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for',
    'while', 'do', 'switch', 'case', 'break', 'continue', 'class',
    'extends', 'super', 'new', 'this', 'typeof', 'instanceof', 'in',
    'of', 'import', 'export', 'default', 'from', 'async', 'await',
    'try', 'catch', 'finally', 'throw', 'true', 'false', 'null',
    'undefined', 'void', 'delete', 'yield', 'static', 'get', 'set',
  ]
  const kwRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g')
  escaped = escaped.replace(kwRegex, '<span class="hl-keyword">$1</span>')

  // Numbers
  escaped = escaped.replace(
    /\b(\d+(?:\.\d+)?)\b/g,
    '<span class="hl-number">$1</span>',
  )

  // Function names
  escaped = escaped.replace(
    /\b([a-zA-Z_$][\w$]*)\s*(?=\()/g,
    '<span class="hl-function">$1</span>',
  )

  return escaped
}

function highlightTs(code: string): string {
  let escaped = highlightJs(code)

  // TypeScript types (after : or <, before > or ,)
  const tsKeywords = [
    'string', 'number', 'boolean', 'any', 'unknown', 'never', 'void',
    'object', 'symbol', 'bigint', 'type', 'interface', 'enum', 'namespace',
    'abstract', 'implements', 'readonly', 'as', 'is', 'satisfies',
    'Partial', 'Required', 'Readonly', 'Pick', 'Omit', 'Record',
    'Extract', 'Exclude', 'ReturnType', 'Parameters', 'Awaited',
  ]
  const tsKwRegex = new RegExp(`\\b(${tsKeywords.join('|')})\\b`, 'g')
  escaped = escaped.replace(
    tsKwRegex,
    '<span class="hl-type">$1</span>',
  )

  return escaped
}

export function highlight(code: string, language: LibraryId | 'text'): string {
  switch (language) {
    case 'html':
      return highlightHtml(code)
    case 'css':
      return highlightCss(code)
    case 'javascript':
      return highlightJs(code)
    case 'typescript':
      return highlightTs(code)
    default:
      return escapeHtml(code)
  }
}
