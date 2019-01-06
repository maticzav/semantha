import Octokit from '@octokit/rest'
import {
  SemanthaRelease,
  SemanthaRule,
  getCommitsSinceLastRelease,
  analyzeCommits,
  releaseWorkspace,
  constants,
} from 'semantha-core'
import { Configuration, getConfigurationFrom } from './config'

export interface Report {
  configuration: Configuration
  releases: SemanthaRelease
}

/**
 *
 * Manager
 *
 */
export async function manage(): Promise<
  { status: 'ok'; report: Report } | { status: 'err'; message: string }
> {
  /* Semantha configuration */

  const configuration = await getConfigurationFrom(options.cwd)

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
    token: 'token',
  })

  /* Verify local version */

  // TODO:

  /** Fetch commits from last release */

  const commits = await getCommitsSinceLastRelease(
    client,
    configuration.config.repository,
  )

  /** Analyzes commits */

  const releases = await analyzeCommits(
    configuration.config.workspaces,
    commits,
    releaseRules,
  )

  /* Publish */

  const releaseReports = await Promise.all(
    releases.map(release => releaseWorkspace(release)),
  )

  return {
    status: 'ok',
    report: {
      configuration: configuration.config,
      releases: releaseReports,
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
