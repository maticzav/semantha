import * as glob from 'globby'
import { getConfiguration } from './config'
import { getCommitsSinceLastRelease } from './github'

export async function semantha() {
  /** Obtains Semantha configuration */
  const configuration = await getConfiguration({ cwd: process.cwd() })

  if (configuration.status === 'err') {
    return {}
  }

  /** Fetches all commits from last release */
  const commits = await getCommitsSinceLastRelease(
    {} as any,
    configuration.config.repository,
  )

  /** Analyzes commits */
  const changes = await analyzeCommits({} as any, configuration.config, commits)

  /**
   * Helper functions
   */
}
