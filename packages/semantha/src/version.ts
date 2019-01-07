import { SemanthaRelease, versionWorkspace } from 'semantha-core'
import writePkg from 'write-pkg'

/**
 *
 * Versions workspace and updated package.json
 *
 * @param release
 * @param releases
 */
export async function prepareWorkspace(
  release: SemanthaRelease,
  releases: SemanthaRelease[],
): Promise<
  | { status: 'ok'; release: SemanthaRelease }
  | { status: 'err'; message: string }
> {
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
