import * as semver from 'semver'
import { SemanthaVersion } from './constants'
import { SemanthaRelease } from './analyser'

/**
 *
 * Version workspace with latest tag.
 *
 * @param release
 */
export function versionWorkspace(
  release: SemanthaRelease,
  releases: SemanthaRelease[],
): {
  version: string
  dependencies: { [dependency: string]: string }
  devDependencies: { [dependency: string]: string }
} {
  /* Calculate diff */

  const version = getNextVersion(release)
  const dependencies = diffDependencies({})
  const devDependencies = {}

  return {
    version,
    dependencies,
    devDependencies,
  }

  /* Helper functions */
  /**
   *
   * Finds diff between package dependencies and release.
   *
   * @param dependencies
   */
  function diffDependencies(dependencies: {
    [name: string]: string
  }): { [name: string]: string } {
    return Object.keys(dependencies).reduce((acc, dependency) => {
      const dependencyRelease = releases.find(
        release => release.workspace.pkg.name === dependency,
      )

      if (dependencyRelease) {
        return {
          ...acc,
          [dependency]: getNextVersion(dependencyRelease),
        }
      } else {
        return acc
      }
    }, {})
  }
}

/**
 *
 * Calculates the next version of the release.
 *
 * @param release
 */
export function getNextVersion(release: SemanthaRelease): string {
  /* Figure out release type */
  const releaseType = getReleaseType(release.releaseType)

  if (releaseType === null) {
    return release.workspace.pkg.version
  }

  const nextVersion = semver.inc(release.workspace.pkg.version, releaseType)!

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
