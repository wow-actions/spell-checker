import * as core from '@actions/core'
import * as github from '@actions/github'
import { parsePatch } from './patch'
import { check } from './providers'

export type Octokit = ReturnType<typeof getOctokit>

export function getOctokit() {
  const token = core.getInput('GITHUB_TOKEN', { required: true })
  return github.getOctokit(token)
}

export async function getChangedFiles(octokit: Octokit) {
  const { context } = github
  const eventName = context.eventName

  let base: string | undefined
  let head: string | undefined

  if (eventName === 'pull_request') {
    const pr = context.payload.pull_request!
    base = pr.base.sha
    head = pr.head.sha
  } else if (eventName === 'push') {
    base = context.payload.before
    head = context.payload.after
  } else {
    throw new Error(
      `This action only supports pull requests and pushes, ${eventName} events are not supported. ` +
        "Please submit an issue on this action's GitHub repo if you believe this in correct.",
    )
  }

  core.info(`Base commit: ${base}`)
  core.info(`Head commit: ${head}`)

  if (!base || !head) {
    throw new Error(
      `The base and head commits are missing from the payload for this ${eventName} event. ` +
        "Please submit an issue on this action's GitHub repo.",
    )
  }

  const res = await octokit.rest.repos.compareCommits({
    ...context.repo,
    base,
    head,
  })

  // Ensure that the head commit is ahead of the base commit.
  if (res.data.status !== 'ahead') {
    core.setFailed(
      `The head commit for this ${eventName} event is not ahead of the base commit. ` +
        "Please submit an issue on this action's GitHub repo.",
    )
  }

  const files = res.data.files || []

  return files.filter(
    ({ status }) => status === 'added' || status === 'modified',
  )
}

type Annotations = {
  path: string
  start_line: number
  end_line: number
  annotation_level: string
  message: string
}

type Conclusion =
  | 'success'
  | 'failure'
  | 'neutral'
  | 'cancelled'
  | 'skipped'
  | 'timed_out'
  | 'action_required'

const CHECK_NAME = 'Spell Checker'

export async function createCheck(
  octokit: Octokit,
  meta: {
    status: 'in_progress' | 'completed' | 'queued'
    conclusion?: Conclusion
    started_at?: string
    completed_at?: string
    output: {
      title: string
      summary: string
      annotations?: Annotations[]
    }
  },
) {
  const { context } = github
  const pr = context.payload.pull_request
  const sha = pr ? pr.head.sha : context.payload.after
  const ref = pr ? pr.head.ref : context.payload.ref

  return octokit.rest.checks.create({
    ...github.context.repo,
    name: CHECK_NAME,
    head_sha: sha,
    head_branch: ref,
    ...meta,
  })
}

async function getFileContent(octokit: Octokit, filename: string) {
  const { context } = github
  const pr = context.payload.pull_request
  const { data } = await octokit.rest.repos.getContent({
    ...context.repo,
    path: filename,
    ref: pr ? pr.head.ref : context.payload.ref,
  })

  return Buffer.from((data as any).content, 'base64').toString()
}

function getPatchedLines(patch: string) {
  const lines: number[] = []
  parsePatch(patch).forEach(({ lineNumber }) => {
    if (!lines.includes(lineNumber)) {
      lines.push(lineNumber)
    }
  })
  return lines
}

export async function spellCheck(
  octokit: Octokit,
  check_run_id: number,
  files: { filename: string; patch?: string }[],
) {
  const arr = await Promise.all(
    files.map(async ({ filename, patch }) => {
      if (patch) {
        const content = await getFileContent(octokit, filename)
        const lines = getPatchedLines(patch)
        const results = check(content).filter(({ line }) =>
          lines.includes(line),
        )
        return {
          filename,
          results,
        }
      }
      return {
        filename,
        results: [],
      }
    }),
  )

  let conclusion: Conclusion = 'success'
  let numSugFiles = 0
  let numSugs = 0
  let numErrFiles = 0
  let numErrs = 0

  const annotations: Annotations[] = []

  arr.forEach(({ filename, results }) => {
    let hasError = false
    let hasSuggestion = false
    if (results.length) {
      results.forEach((result) => {
        if (result.type === 'failure') {
          numErrs += 1
          hasError = true
          conclusion = 'failure'
        } else {
          hasSuggestion = true
          numSugs += 1
        }

        annotations.push({
          path: filename,
          start_line: result.line,
          end_line: result.line,
          annotation_level: result.type || 'warning',
          message: `${result.reason} (by [${result.name}](${result.url}))`,
        })
      })
    }

    if (hasError) {
      numErrFiles += 1
    }
    if (hasSuggestion) {
      numSugFiles += 1
    }
  })

  let summary = ''
  let title = ''
  const s = (num: number) => (num === 1 ? '' : 's')

  if (conclusion === 'success') {
    title = annotations.length ? 'Good Spelling' : 'Perfect Spelling'
    summary = annotations.length
      ? `Found Spelling Suggestion${s(annotations.length)}`
      : 'No issues have been found, great job!'
  } else {
    title = `Found Spelling Error${s(numErrs)}`
    const summarys: string[] = []
    if (numErrs) {
      summarys.push(
        `**${numErrs} error${s(numErrs)}** ${
          numErrs === 1 ? 'has' : 'have'
        } been found in **${numErrFiles} file${s(numErrFiles)}**.`,
      )
    }
    if (numSugs) {
      summarys.push(
        `**${numSugs} suggestion${s(numSugs)}** ${
          numSugs === 1 ? 'has' : 'have'
        } been found in **${numSugFiles} file${s(numSugFiles)}**.`,
      )
    }
    summary = summarys.join('\n\n')
  }

  while (annotations.length) {
    const parts = annotations.splice(0, 50)
    // eslint-disable-next-line no-await-in-loop
    await octokit.rest.checks.update({
      ...github.context.repo,
      check_run_id,
      conclusion,
      status: 'completed',
      completed_at: new Date().toISOString(),
      output: {
        title,
        summary,
        annotations: parts,
      },
    })
  }
}
