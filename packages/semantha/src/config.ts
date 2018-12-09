import readPkg from 'read-pkg'
import { getRepositoryFromURL, GithubRepository } from './github'

export interface Configuration {
  repository: GithubRepository
  workspaces: string[]
}

/**
 *
 * Finds Semantha configuration in a particular cwd.
 *
 * @param cwd
 */
export async function getConfiguration({
  cwd,
}: {
  cwd: string
}): Promise<
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

    /** Parses information */
    const repository = getRepositoryFromURL(pkg.repository)

    if (repository.status === 'err') {
      return {
        status: 'err',
        message: "Something's wrong with your repository definition.",
      }
    }

    return {
      status: 'ok',
      config: {
        repository: repository.repo,
        workspaces: pkg.workspaces,
      },
    }
  } catch (err) {
    return { status: 'err', message: err.message }
  }
}
