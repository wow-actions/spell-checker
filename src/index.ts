import * as core from '@actions/core'
import minimatch from 'minimatch'
import parseInputs from '@wow-actions/parse-inputs'
import { getChangedFiles, getOctokit, createCheck, spellCheck } from './util'

export async function run() {
  try {
    const octokit = getOctokit()
    const changedFiles = await getChangedFiles(octokit)
    const { include, exclude } = parseInputs({
      include: { type: 'stringArray' },
      exclude: { type: 'stringArray' },
    })

    core.debug(
      `changed files: ${JSON.stringify(
        changedFiles.map(({ filename }) => filename),
        null,
        2,
      )}`,
    )

    const targetFiles = changedFiles.filter(({ filename }) => {
      const included = include
        ? include.some((pattren) => minimatch(filename, pattren))
        : true
      const excluded = exclude
        ? exclude.some((pattren) => minimatch(filename, pattren))
        : false
      return included && !excluded
    })

    const filenames = targetFiles.map(({ filename }) => filename)

    core.info(`checking files: ${JSON.stringify(filenames, null, 2)}`)

    if (targetFiles.length === 0) {
      await createCheck(octokit, {
        status: 'completed',
        conclusion: 'neutral',
        completed_at: new Date().toISOString(),
        output: {
          title: 'No Matched Files',
          summary: 'There were no matched files that needed checking.',
        },
      })
    } else {
      const { data } = await createCheck(octokit, {
        status: 'in_progress',
        started_at: new Date().toISOString(),
        output: {
          title: 'Checking',
          summary: `Files: ${JSON.stringify(filenames, null, 2)}`,
        },
      })

      await spellCheck(octokit, data.id, targetFiles)
    }
  } catch (e) {
    core.error(e)
    core.setFailed(e.message)
  }
}

run()
