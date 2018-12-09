import * as globby from 'globby'
import readPkg, { Package } from 'read-pkg'

export interface Workspace {
  path: string
  pkg: Package
}

/**
 *
 * Finds definitions for workspaces in specified cwd
 *
 * @param patterns
 * @param cwd
 */
export async function getAllWorkspacesForPaths(
  patterns: string[],
  cwd: string,
): Promise<
  { status: 'ok'; workspaces: Workspace[] } | { status: 'err'; message: string }
> {
  try {
    /** Find all paths */
    const paths = await globby(patterns, {
      cwd: cwd,
      onlyDirectories: true,
      gitignore: true,
    })

    /** Hydrate workspaces */
    const workspaces = await Promise.all(paths.map(hydrateWorkspace))

    return { status: 'ok', workspaces: workspaces }
  } catch (err) {
    return { status: 'err', message: err.message }
  }

  /**
   * Helper function
   */
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
      path: path,
      pkg: pkg,
    }
  }
}
