import * as core from '@actions/core'
import { getObjectInput } from '@wow-actions/parse-inputs'
import * as alex from './alex'
import * as writeGood from './writegood'
import * as spellCheck from './spellcheck'
import { Results } from './types'

export { alex, writeGood as writegood, spellCheck as spellcheck }

function getOptions<T>(name: string) {
  const raw = core.getInput(name)
  if (!raw || raw.toLowerCase() === 'true') {
    return true
  }

  if (raw.toLowerCase() === 'false') {
    return false
  }

  return getObjectInput<T>(name)
}

const alexOptions = getOptions<alex.Options>(alex.name)
const writeGoodOptions = getOptions<writeGood.Options>(writeGood.name)
const spellCheckOptions = getOptions<writeGood.Options>(spellCheck.name)

export function check(content: string) {
  const results: Results = []

  if (alexOptions) {
    results.push(
      ...alex.check(
        content,
        typeof alexOptions === 'object' ? alexOptions : undefined,
      ),
    )
  }

  if (writeGoodOptions) {
    results.push(
      ...writeGood.check(
        content,
        typeof writeGoodOptions === 'object' ? writeGoodOptions : undefined,
      ),
    )
  }

  if (spellCheckOptions) {
    results.push(
      ...spellCheck.check(
        content,
        typeof spellCheckOptions === 'object' ? spellCheckOptions : undefined,
      ),
    )
  }

  return results
}
