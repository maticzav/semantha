import readPkg from 'read-pkg'
import parseGithubUrl from 'parse-github-url'
import { GithubRepository } from './github'
import { Workspace, findAllWorkspacesForPaths } from './workspaces'

export interface Configuration {
  repository: GithubRepository
  workspaces: Workspace[]
}

/**
 *
 * Finds Semantha configuration in a particular cwd.
 *
 * @param cwd
 */
export async function getConfigurationFrom(
  cwd: string,
): Promise<
  { status: 'ok'; config: Configuration } | { status: 'err'; message: string }
> {
  try {
    /** Finds package.json file */
    const pkg = await readPkg({ cwd: cwd, normalize: true })

    if (!pkg.repository || !pkg.workspaces) {
      return {
        status: 'err',
        message: 'Missing workspaces or repository definition in package.json',
      }
    }

    /** Determines repository */

    const repository = getRepositoryFromURL(pkg.repository.url)

    if (repository.status === 'err') {
      return {
        status: 'err',
        message: "Something's wrong with your repository definition.",
      }
    }

    /* Finds workspaces */

    const workspaces = await findAllWorkspacesForPaths(pkg.workspaces, cwd)

    if (workspaces.status === 'err') {
      return { status: 'err', message: workspaces.message }
    }

    return {
      status: 'ok',
      config: {
        repository: repository.repo,
        workspaces: workspaces.workspaces,
      },
    }
  } catch (err) {
    return { status: 'err', message: err.message }
  }

  /* Helper functions */

  /**
   *
   * Obtains repository information from repository URL.
   *
   * @param url
   */
  function getRepositoryFromURL(
    url: string,
  ): { status: 'ok'; repo: GithubRepository } | { status: 'err' } {
    const repository = parseGithubUrl(url)

    if (repository && repository.owner && repository.repo) {
      return {
        status: 'ok',
        repo: { owner: repository.owner, repo: repository.repo },
      }
    } else {
      return { status: 'err' }
    }
  }
}
