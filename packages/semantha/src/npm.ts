import * as fs from 'fs'
// import { sync as execa } from 'execa'
// import * as libnpmpublish from 'libnpmpublish'
import _ from 'lodash'
import * as path from 'path'
import { SemanthaRelease, Dependency, getNextVersion } from 'semantha-core'
import { filterMap } from './utils'

export interface Package {
  raw: string
  name: string
  version: string
  dependencies: Dependency[]
}

/**
 *
 * Loads package definition from path.
 *
 * @param pkgPath
 */
export async function loadPackage(
  pkgPath: string,
): Promise<
  { status: 'ok'; pkg: Package } | { status: 'err'; message: string }
> {
  try {
    const configPath = path.resolve(pkgPath, 'package.json')
    const raw = fs.readFileSync(configPath, 'utf-8')

    const parsed = JSON.parse(raw)

    if (!parsed.name || !parsed.version) {
      return { status: 'err', message: 'Missing package definition.' }
    }

    const depTypes: Dependency['type'][] = [
      'dependencies',
      'devDependencies',
      'optionalDependencies',
      'peerDependencies',
      'bundleDependencies',
    ]

    const dependencies = depTypes.reduce<Dependency[]>((acc, type) => {
      if (parsed[type]) {
        const typeDeps: Dependency[] = Object.keys(parsed[type]).map(dep => ({
          name: dep,
          type: type,
          version: parsed[type][dep],
        }))

        return [...acc, ...typeDeps]
      } else {
        return acc
      }
    }, [])

    return {
      status: 'ok',
      pkg: {
        raw: raw,
        name: parsed.name,
        version: parsed.version,
        dependencies: dependencies,
      },
    }
  } catch (err) {
    return {
      status: 'err',
      message: `Couldn't load package: ${err.message}`,
    }
  }
}

export interface PublishOptions {
  registry: string
}

/**
 *
 * Publishes release to NPM.
 *
 * @param release
 */
export function publish(
  release: SemanthaRelease,
  options: PublishOptions,
):
  | { status: 'ok'; release: SemanthaRelease }
  | { status: 'err'; message: string } {
  try {
    // const pkgJson = require(release.workspace.path)

    return { status: 'ok', release: release }
  } catch (err) {
    return { status: 'err', message: err.message }
  }

  /* Helper functions */
}

/**
 *
 * Updates package.json file of a released package.
 *
 * @param release
 */
export function applyVersionsToPackage(
  pkg: Package,
  releases: SemanthaRelease[],
): string {
  /* Updates the package version */

  const pkgRelease = releases.find(
    release => release.workspace.pkg.name === pkg.name,
  )!

  const pjWithVersion = updateVersion(pkg.raw, getNextVersion(pkgRelease)!)

  /**
   * Compares package dependencies with releases and updates matches
   * to the latest calculated version.
   */
  const dependencies = filterMap<Dependency, Dependency>(dependency => {
    const release = releases.find(
      release => release.workspace.pkg.name === dependency.name,
    )

    /* Generates a new dependency if found */
    if (release) {
      return {
        name: dependency.name,
        type: dependency.type,
        version: getNextVersion(release)!,
      }
    } else {
      return null
    }
  }, pkg.dependencies)

  const pjWithDependencies = dependencies.reduce((acc, dependency) => {
    return updateDependency(acc, dependency)
  }, pjWithVersion)

  return pjWithDependencies

  /* Helper functions */
  /**
   * Thanks Rhys Arkins for explaining how renovate works.
   * All functions below are inspired by how renovate works.
   */

  /**
   *
   * Updates package version in package.json file.
   *
   * @param raw
   * @param dependency
   */
  function updateVersion(raw: string, version: string): string {
    /**
     * First update version in parsed package.json, then
     * repeat updating raw package.json files until parsed versions
     * match.
     */
    let parsed = JSON.parse(raw)
    const oldVersion = parsed.version

    /* Update parsed package.json */
    parsed.version = version

    const searchString = `"${oldVersion}"`
    const newString = `"${version}"`

    let newContent = null
    let searchIndex = raw.indexOf(`"version"`) + 'version'.length

    for (; searchIndex < raw.length; searchIndex += 1) {
      if (matchAt(raw, searchIndex, searchString)) {
        const testContent = replaceAt(raw, searchIndex, searchString, newString)

        if (_.isEqual(parsed, JSON.parse(testContent))) {
          newContent = testContent
          break
        }
      }
    }

    return newContent!
  }

  /**
   *
   * Updates dependency version in package.json file.
   *
   * @param raw
   * @param dependency
   */
  function updateDependency(raw: string, dependency: Dependency): string {
    /**
     * First update dependencies in parsed package.json, then
     * repeat updating raw package.json files until parsed versions
     * match.
     */
    let parsed = JSON.parse(raw)
    const oldVersion = parsed[dependency.type][dependency.name]

    /* Update parsed package.json */
    parsed[dependency.type][dependency.name] = dependency.version

    const searchString = `"${oldVersion}"`
    const newString = `"${dependency.version}"`

    let newContent = null
    let searchIndex =
      raw.indexOf(`"${dependency.type}"`) + dependency.type.length

    for (; searchIndex < raw.length; searchIndex += 1) {
      if (matchAt(raw, searchIndex, searchString)) {
        const testContent = replaceAt(raw, searchIndex, searchString, newString)

        if (_.isEqual(parsed, JSON.parse(testContent))) {
          newContent = testContent
          break
        }
      }
    }

    return newContent!
  }

  /**
   *
   * @param content
   * @param index
   * @param match
   */
  function matchAt(content: string, index: number, match: string): boolean {
    return content.substring(index, index + match.length) === match
  }

  /**
   *
   *
   *
   * @param content
   * @param index
   * @param oldString
   * @param newString
   */
  function replaceAt(
    content: string,
    index: number,
    oldString: string,
    newString: string,
  ): string {
    return (
      content.substr(0, index) +
      newString +
      content.substr(index + oldString.length)
    )
  }
}
