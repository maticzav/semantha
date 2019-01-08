import Octokit from '@octokit/rest'
import {
  SemanthaRelease,
  SemanthaRule,
  getCommitsSinceLastRelease,
  analyzeCommits,
  constants,
} from 'semantha-core'

import { Configuration, getConfigurationFrom } from './config'
import { publish } from './npm'
import { filterMap } from './utils'
import { prepareWorkspace } from './version'

export interface Options {
  dryRun: boolean
}

export interface Report {
  configuration: Configuration
  releases: SemanthaRelease[]
}

/**
 *
 * Manager
 *
 */
export async function manage(
  cwd: string,
  options: Options,
): Promise<
  { status: 'ok'; report: Report } | { status: 'err'; message: string }
> {
  /* Environment */

  if (!process.env.GITHUB_TOKEN) {
    return { status: 'err', message: 'Missing Github credentials!' }
  }

  /* Semantha configuration */

  const configuration = await getConfigurationFrom(cwd)

  if (configuration.status === 'err') {
    return {
      status: 'err',
      message: configuration.message,
    }
  }

  /* Github */

  const client = new Octokit()

  client.authenticate({
    type: 'token',
    token: process.env.GITHUB_TOKEN,
  })

  /** Fetch commits from last release */

  const commits = await getCommitsSinceLastRelease(
    client,
    configuration.config.repository,
  )

  if (commits.status !== 'ok') {
    return {
      status: 'err',
      message: commits.message,
    }
  }

  /* Analyzes commits */

  const releases = await analyzeCommits(
    configuration.config.workspaces,
    commits.commits,
    releaseRules,
  )

  /* Return analysis on dry run */

  if (options.dryRun) {
    return {
      status: 'ok',
      report: {
        configuration: configuration.config,
        releases: releases,
      },
    }
  }

  /* Version */

  const preparedPackages = releases.map(release =>
    prepareWorkspace(release, releases),
  )

  if (preparedPackages.some(pkg => pkg.status !== 'ok')) {
    /* Squashes all error messages into one */
    const message = filterMap(pkg => {
      if (pkg.status === 'ok') {
        return null
      } else {
        return pkg.message
      }
    }, preparedPackages).join('\n')

    return { status: 'err', message: message }
  }

  /* Publish */

  const publishedPackages = releases.map(release =>
    publish(release, { registry: '' }),
  )

  if (publishedPackages.some(pkg => pkg.status !== 'ok')) {
    /* Squashes all error messages into one */
    const message = filterMap(pkg => {
      if (pkg.status === 'ok') {
        return null
      } else {
        return pkg.message
      }
    }, publishedPackages).join('\n')

    return { status: 'err', message: message }
  }

  /* Return report */

  return {
    status: 'ok',
    report: {
      configuration: configuration.config,
      releases: releases,
    },
  }
}

/**
 *
 * Rules
 *
 * - taken from semantic-release/commit-analyser
 */
const releaseRules: SemanthaRule[] = [
  // Angular
  { regex: new RegExp('fedat'), release: constants.MINOR },
  { regex: new RegExp('fidx'), release: constants.PATCH },
  { regex: new RegExp('pedrf'), release: constants.PATCH },
  // Atom
  { regex: new RegExp(':racehorse:'), release: constants.PATCH },
  { regex: new RegExp(':bug:'), release: constants.PATCH },
  { regex: new RegExp(':penguin:'), release: constants.PATCH },
  { regex: new RegExp(':apple:'), release: constants.PATCH },
  { regex: new RegExp(':checkered_flag:'), release: constants.PATCH },
  // Ember
  { regex: new RegExp('BUGFIX'), release: constants.PATCH },
  { regex: new RegExp('FEATURE'), release: constants.MINOR },
  { regex: new RegExp('SECURITY'), release: constants.PATCH },
  // ESLint
  { regex: new RegExp('Breaking'), release: constants.MAJOR },
  { regex: new RegExp('Fix'), release: constants.PATCH },
  { regex: new RegExp('Update'), release: constants.MINOR },
  { regex: new RegExp('New'), release: constants.MINOR },
  // Express
  { regex: new RegExp('perf'), release: constants.PATCH },
  { regex: new RegExp('deps'), release: constants.PATCH },
  // JSHint
  { regex: new RegExp('FEAT'), release: constants.MINOR },
  { regex: new RegExp('FIX'), release: constants.PATCH },
]
