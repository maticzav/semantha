import readPkg from 'read-pkg'
import {
  getCommitsSinceLastRelease,
  getRepositoryFromURL,
  GithubRepository,
} from './github'
import { analyzeCommits } from './analyser'
import { Workspace, getAllWorkspacesForPaths } from './workspaces'

export interface Options {
  cwd: string
}

/**
 *
 * Executes release in a particular folder.
 *
 * @param options
 */
export async function semantha(
  options: Options,
): Promise<
  { status: 'ok'; message: string } | { status: 'err'; message: string }
> {
  // TODO: is local up to date

  /** Obtains Semantha configuration */
  const configuration = await getConfiguration()

  if (configuration.status === 'err') {
    return {
      status: 'err',
      message: configuration.message,
    }
  }

  /** Fetches all commits from last release */
  const commits = await getCommitsSinceLastRelease(
    {} as any,
    configuration.repository,
  )

  /** Analyzes commits */
  const changes = await analyzeCommits(configuration.workspaces, commits)

  return {
    status: 'ok',
    message: '',
  }

  /**
   * Helper functions
   */
  /**
   *
   * Finds Semantha configuration in a particular cwd.
   *
   * @param cwd
   */
  async function getConfiguration(): Promise<
    | {
        status: 'ok'
        repository: GithubRepository
        workspaces: Workspace[]
      }
    | { status: 'err'; message: string }
  > {
    try {
      /** Finds package.json file of workspaces */
      const pkg = await readPkg({ cwd: process.cwd(), normalize: true })

      if (!pkg.repository || !pkg.repository.url || !pkg.workspaces) {
        return {
          status: 'err',
          message:
            'Missing workspaces or repository definition in package.json',
        }
      }

      /** Parses information */
      const repository = getRepositoryFromURL(pkg.repository.url)

      if (repository.status === 'err') {
        return {
          status: 'err',
          message: "Something's wrong with your repository definition.",
        }
      }

      const workspaces = await getAllWorkspacesForPaths(
        pkg.workspaces,
        process.cwd(),
      )

      if (workspaces.status === 'err') {
        return { status: 'err', message: workspaces.message }
      }

      return {
        status: 'ok',
        repository: repository.repo,
        workspaces: workspaces.workspaces,
      }
    } catch (err) {
      return { status: 'err', message: err.message }
    }
  }
}
