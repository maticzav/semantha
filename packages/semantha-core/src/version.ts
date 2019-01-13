import * as semver from 'semver'
import { SemanthaRelease } from './analyser'

/**
 *
 * Calculates next package version from release.
 *
 * @param release
 */
export function getNextVersion(release: SemanthaRelease): string | null {
  switch (release.releaseType.type) {
    case 'major':
    case 'minor':
    case 'patch': {
      return semver.inc(release.workspace.pkg.version, release.releaseType.type)
    }
    case 'premajor':
    case 'preminor':
    case 'prepatch':
    case 'prerelease': {
      return semver.inc(
        release.workspace.pkg.version,
        release.releaseType.type,
        release.releaseType.tag,
      )
    }
    case 'ignore': {
      return release.workspace.pkg.version
    }
  }
}
