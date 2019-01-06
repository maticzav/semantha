import Octokit from '@octokit/rest'
import {
  SemanthaRelease,
  getCommitsSinceLastRelease,
  analyzeCommits,
  releaseWorkspace,
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
