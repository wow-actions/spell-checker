const lineRegex = /^@@ -([0-9]*),?\S* \+([0-9]*),?/

type Token = {
  lines: string[]
  deletedStartLineNumber: number
  addedStartLineNumber: number
}

function tokenlize(lines: string[]) {
  const tokens: Token[] = []

  let token: Token

  lines.forEach((line) => {
    if (line.startsWith('@@')) {
      const [, deletedStartLineNumber, addedStartLineNumber] =
        line.match(lineRegex)!
      token = {
        deletedStartLineNumber: parseInt(deletedStartLineNumber, 10),
        addedStartLineNumber: parseInt(addedStartLineNumber, 10),
        lines: [],
      }
      tokens.push(token)
    } else {
      token.lines.push(line)
    }
  })

  return tokens
}

export function parsePatch(patch: string) {
  const lines = patch.split('\n')

  const patches: {
    type: 'added' | 'deleted'
    line: string
    lineNumber: number
  }[] = []

  tokenlize(lines).forEach((token) => {
    let addedLineNumber = token.addedStartLineNumber
    let deletedLineNumber = token.deletedStartLineNumber

    token.lines.forEach((line) => {
      if (line.startsWith('+')) {
        patches.push({
          type: 'added',
          line: line.substring(1),
          lineNumber: addedLineNumber,
        })
        addedLineNumber += 1
      } else if (line.startsWith('-')) {
        patches.push({
          type: 'deleted',
          line: line.substring(1),
          lineNumber: deletedLineNumber,
        })
        deletedLineNumber += 1
      } else {
        addedLineNumber += 1
        deletedLineNumber += 1
      }
    })
  })

  return patches
}
