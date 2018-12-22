import Octokit from '@octokit/rest'
import { getCommitsSinceLastRelease, GithubCommit } from './github'
import { analyzeCommits, Release } from './analyser'
import { getConfigurationFrom, Configuration } from './config'
import { publishWorkspacesToNPM } from './npm'

export interface Options {
  cwd: string
  dryrun: boolean
}

export interface Report {
  configuration: Configuration
  commits: GithubCommit[]
  changes: Release[]
  release: any
}

/**
 *
 * Executes semantic release in a particular folder.
 *
 * @param options
 */
export async function semantha(
  options: Options,
): Promise<
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

  const changes = await analyzeCommits(configuration.config.workspaces, commits)

  /* Publish */

  const release = await publishWorkspacesToNPM(changes)

  return {
    status: 'ok',
    report: {
      configuration: configuration.config,
      commits: commits,
      changes: changes,
      release: release,
    },
  }
}
