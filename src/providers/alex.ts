import { markdown, Options } from 'alex'
import { Results } from './types'

export const name = 'alex'
export const url = 'https://www.npmjs.com/package/alex'
export { Options }

export function check(content: string, options?: Options): Results {
  const { messages } = markdown(content, options)
  return messages.map((reason) => ({
    name,
    url,
    line: reason.line!,
    reason: reason.message,
    type: reason.fatal ? 'failing' : 'warning',
  }))
}
