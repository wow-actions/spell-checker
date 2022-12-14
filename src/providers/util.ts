export function pos(contents: string, index: number) {
  const lines = contents.split('\n')
  const line = contents.substring(0, index).split('\n').length

  const startOfLineIndex = (() => {
    const x = lines.slice(0)
    x.splice(line - 1)
    return x.join('\n').length + (x.length > 0)
  })()

  const col = index - startOfLineIndex

  return { line, col }
}
