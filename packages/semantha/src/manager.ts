import Octokit from '@octokit/rest'
import {
  SemanthaRelease,
  SemanthaRule,
  getCommitsSinceLastRelease,
  analyzeCommits,
  releaseWorkspace,
  constants,
} from 'semantha-core'
import { Configuration } from './config'

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
  )

  /* Publish */

  const releaseReports = await Promise.all(release => releaseWorkspace(release))

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
  { rule: new RegExp('fedat'), release: constants.MINOR },
  { rule: new RegExp('fidx'), release: constants.PATCH },
  { rule: new RegExp('pedrf'), release: constants.PATCH },
  // Atom
  { rule: new RegExp(':racehorse:'), release: constants.PATCH },
  { rule: new RegExp(':bug:'), release: constants.PATCH },
  { rule: new RegExp(':penguin:'), release: constants.PATCH },
  { rule: new RegExp(':apple:'), release: constants.PATCH },
  { rule: new RegExp(':checkered_flag:'), release: constants.PATCH },
  // Ember
  { rule: new RegExp('BUGFIX'), release: constants.PATCH },
  { rule: new RegExp('FEATURE'), release: constants.MINOR },
  { rule: new RegExp('SECURITY'), release: constants.PATCH },
  // ESLint
  { rule: new RegExp('Breaking'), release: constants.MAJOR },
  { rule: new RegExp('Fix'), release: constants.PATCH },
  { rule: new RegExp('Update'), release: constants.MINOR },
  { rule: new RegExp('New'), release: constants.MINOR },
  // Express
  { rule: new RegExp('perf'), release: constants.PATCH },
  { rule: new RegExp('deps'), release: constants.PATCH },
  // JSHint
  { rule: new RegExp('FEAT'), release: constants.MINOR },
  { rule: new RegExp('FIX'), release: constants.PATCH },
]
