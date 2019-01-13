import globby from 'globby'
import parseGithubUrl from 'parse-github-url'
import { sync as readPkg } from 'read-pkg'
import { GithubRepository, Workspace } from 'semantha-core'
import { withDefault } from './utils'

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
    /** Find configuration package.json file */
    const pkg = readPkg({ cwd: cwd, normalize: true })

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

    if (repository && repository.owner && repository.name) {
      return {
        status: 'ok',
        repo: { owner: repository.owner, repo: repository.name },
      }
    } else {
      return { status: 'err' }
    }
  }

  /**
   *
   * Finds definitions for workspaces in specified cwd
   *
   * @param patterns
   * @param cwd
   */
  async function findAllWorkspacesForPaths(
    patterns: string[],
    cwd: string,
  ): Promise<
    | { status: 'ok'; workspaces: Workspace[] }
    | { status: 'err'; message: string }
  > {
    try {
      /** Find all paths */
      const paths = await globby(patterns, {
        cwd: cwd,
        onlyDirectories: true,
        gitignore: true,
        absolute: true,
      })

      /** Hydrate workspaces */
      const workspaces = await Promise.all(paths.map(hydrateWorkspace))

      return { status: 'ok', workspaces: workspaces }
    } catch (err) {
      return { status: 'err', message: err.message }
    }
  }

  /**
   *
   * Hydrates workspace in a given path by obtaining its
   * package.json definition.
   *
   * @param path
   */
  async function hydrateWorkspace(path: string): Promise<Workspace> {
    const pkg = await readPkg({ cwd: path })
    return {
      path,
      pkg: {
        name: pkg.name,
        version: pkg.version,
        dependencies: withDefault({})(pkg.dependencies),
        devDependencies: withDefault({})(pkg.devDependencies),
      },
    }
  }
}
