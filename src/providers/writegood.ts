import writeGood, { Options } from 'write-good'
import { Results } from './types'
import { pos } from './util'

export const name = 'write-good'
export const url = 'https://www.npmjs.com/package/write-good'
export { Options }

export function check(content: string, options?: Options): Results {
  return writeGood(content, options).map((reason) => ({
    ...pos(content, reason.index),
    name,
    url,
    reason: reason.reason,
  }))
}
