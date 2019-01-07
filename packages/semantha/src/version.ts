import { SemanthaRelease, versionWorkspace } from 'semantha-core'
import { sync as writePkg } from 'write-pkg'

/**
 *
 * Versions workspace and updated package.json
 *
 * @param release
 * @param releases
 */
export function prepareWorkspace(
  release: SemanthaRelease,
  releases: SemanthaRelease[],
):
  | { status: 'ok'; release: SemanthaRelease }
  | { status: 'err'; message: string } {
  /* Diff workspace dependencies */
  const diff = versionWorkspace(release, releases)

  /* Write to fs */
  try {
    writePkg(release.workspace.path, diff)

    return { status: 'ok', release: release }
  } catch (err) {
    return { status: 'err', message: err.message }
  }
}
