import { sync as readPkg, Package } from 'read-pkg'

export interface Workspace {
  path: string
  pkg: Package
}

/**
 *
 * Loads workspace from path.
 *
 * @param path
 */
export function loadWorkspace(
  path: string,
): { status: 'ok'; workspace: Workspace } | { status: 'err'; message: string } {
  try {
    const pkg = readPkg({ cwd: path })
    return { status: 'ok', workspace: { path, pkg } }
  } catch (err) {
    return { status: 'err', message: err.message }
  }
}
