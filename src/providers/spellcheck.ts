import spellchecker from 'spellchecker'
import markdown from 'markdown-spellcheck'
import { pos } from './util'
import { Results } from './types'

export const name = 'markdown-spellcheck'
export const url = 'https://www.npmjs.com/package/markdown-spellcheck'

function suggest(word: string) {
  const corrections = spellchecker
    .getCorrectionsForMisspelling(word)
    .slice(0, 6)
  return `"${word}" is misspelled. ${
    corrections.length ? `How about: ${corrections.join(', ')}` : ''
  }`
}

export function check(content: string, options?: any): Results {
  return markdown.spell(content, options).map((reason: any) => ({
    ...pos(content, reason.index),
    name,
    url,
    reason: suggest(reason.word),
  }))
}
