import * as core from '@actions/core'
import * as github from '@actions/github'
import { check } from './providers'

export type Octokit = ReturnType<typeof getOctokit>

export function getOctokit() {
  const token = core.getInput('GITHUB_TOKEN', { required: true })
  return github.getOctokit(token)
}

export async function getChangedFiles(octokit: Octokit) {
  const { context } = github
  const pr = context.payload.pull_request
  const eventName = context.eventName
  let files: {
    sha: string
    filename: string
    status:
      | 'added'
      | 'removed'
      | 'modified'
      | 'renamed'
      | 'copied'
      | 'changed'
      | 'unchanged'
  }[]

  if (pr) {
    const { data } = await octokit.rest.pulls.listFiles({
      ...context.repo,
      pull_number: pr.number,
    })
    files = data
  } else if (eventName === 'push') {
    const base: string = context.payload.before
    const head: string = context.payload.after
    const res = await octokit.rest.repos.compareCommits({
      ...context.repo,
      base,
      head,
    })
    // Ensure that the head commit is ahead of the base commit.
    if (res.data.status !== 'ahead') {
      throw new Error(
        `The head commit for this ${context.eventName} event is not ahead of the base commit. `,
      )
    }
    files = res.data.files || []
  } else {
    throw new Error(
      `This action only supports pull requests and pushes, ${context.eventName} events are not supported. ` +
        "Please submit an issue on this action's GitHub repo if you believe this in correct.",
    )
  }

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

const CHECK_NAME = 'SpellChecker'

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

export async function getFileContent(octokit: Octokit, filename: string) {
  const { context } = github
  const pr = context.payload.pull_request
  const { data } = await octokit.rest.repos.getContent({
    ...context.repo,
    path: filename,
    ref: pr ? pr.head.ref : context.payload.ref,
  })

  return Buffer.from((data as any).content, 'base64').toString()
}

export async function spellCheck(
  octokit: Octokit,
  check_run_id: number,
  files: string[],
) {
  const arr = await Promise.all(
    files.map(async (filename) => {
      const content = await getFileContent(octokit, filename)
      const results = check(content)
      return {
        filename,
        results,
      }
    }),
  )

  let conclusion: Conclusion = 'success'
  let numFiles = 0
  let numSuggestions = 0

  const annotations: Annotations[] = []

  arr.forEach(({ filename, results }) => {
    if (results.length) {
      numFiles += 1
      numSuggestions += results.length
      results.forEach((result) => {
        if (result.type === 'failure') {
          conclusion = 'failure'
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
  })

  let summary = ''
  let title = ''
  if (conclusion === 'success') {
    title = 'Perfect Spelling'
    summary = 'No issues have been found, great job!'
  } else {
    const s = (num: number) => (num === 1 ? '' : 's')
    title = 'Found Spelling Suggestions'
    summary = `**${numSuggestions} suggestion${s(numSuggestions)}** ${
      numSuggestions === 1 ? 'has' : 'have'
    } been found in **${numFiles} file${s(numFiles)}**.`
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
