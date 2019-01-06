import * as semver from 'semver'
import { SemanthaVersion } from './constants'
import { SemanthaRelease } from './analyser'

/**
 *
 * Releases new workspace version.
 *
 * @param release
 */
export async function releaseWorkspace(release: SemanthaRelease): Promise<any> {
  return
}

/**
 *
 * Calculates the next version of the release.
 *
 * @param release
 */
export function getNextVersion(release: SemanthaRelease): string | null {
  /* Figure out release type */
  const releaseType = getReleaseType(release.version)

  if (releaseType === null) {
    return release.workspace.pkg.version
  }

  const nextVersion = semver.inc(release.workspace.pkg.version, releaseType)

  return nextVersion

  /* Helper functions */
  function getReleaseType(type: SemanthaVersion): semver.ReleaseType | null {
    switch (type) {
      case 1: {
        return 'patch'
      }

      case 2: {
        return 'minor'
      }

      case 3: {
        return 'major'
      }

      default: {
        return null
      }
    }
  }
}
