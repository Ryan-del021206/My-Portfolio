export type TokenType = 'comment' | 'string' | 'keyword' | 'tag' | 'number' | 'punct' | 'plain'

export interface Token {
  type: TokenType
  text: string
}

const KEYWORDS = new Set([
  'import', 'from', 'export', 'default', 'const', 'let', 'function', 'return', 'if', 'else', 'for', 'of',
  'type', 'interface', 'new', 'null', 'undefined', 'true', 'false', 'async', 'await', 'as', 'typeof',
])

// Order matters: comments and strings first, so their contents are never re-tokenised.
const PATTERN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|(<\/?[A-Za-z][\w.]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|([{}()[\];,.=<>/+\-*?:!&|]+)/g

/** A deliberately small TSX highlighter – enough for the hero lens, no dependency. */
export function highlight(source: string): Token[][] {
  const tokens: Token[] = []
  let last = 0
  for (const match of source.matchAll(PATTERN)) {
    const index = match.index
    if (index > last) tokens.push({ type: 'plain', text: source.slice(last, index) })
    const [text, comment, string, tag, number, word] = match
    let type: TokenType = 'punct'
    if (comment) type = 'comment'
    else if (string) type = 'string'
    else if (tag) type = 'tag'
    else if (number) type = 'number'
    else if (word) type = KEYWORDS.has(word) ? 'keyword' : 'plain'
    tokens.push({ type, text })
    last = index + text.length
  }
  if (last < source.length) tokens.push({ type: 'plain', text: source.slice(last) })

  // Split into lines so every line can carry its own number.
  const lines: Token[][] = [[]]
  for (const token of tokens) {
    const parts = token.text.split('\n')
    parts.forEach((part, i) => {
      if (i > 0) lines.push([])
      if (part) lines[lines.length - 1]!.push({ type: token.type, text: part })
    })
  }
  return lines
}
