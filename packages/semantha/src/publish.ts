import execa from 'execa'
import * as fs from 'fs'
import _ from 'lodash'
import * as path from 'path'
import {
  SemanthaRelease,
  Dependency,
  getNextVersion,
  Package,
} from 'semantha-core'
import url from 'url'
import { filterMap } from './utils'

/**
 *
 * Write package.json to package.
 *
 * @param pkgPath
 * @param pkg
 */
export function writePackage(
  pkgPath: string,
  pkg: string,
): { status: 'ok' } | { status: 'err'; message: string } {
  const pjPath = path.resolve(pkgPath, 'package.json')
  try {
    fs.writeFileSync(pjPath, pkg)
    return { status: 'ok' }
  } catch (err) {
    return { status: 'err', message: err.message }
  }
}

export interface PublishOptions {
  registry: string
  token: string
}

/**
 *
 * Publishes release to NPM.
 *
 * @param release
 */
export async function publish(
  release: SemanthaRelease,
  releases: SemanthaRelease[],
  options: PublishOptions,
): Promise<
  | { status: 'ok'; release: SemanthaRelease }
  | { status: 'err'; message: string }
> {
  try {
    /* Update package.json and override the old one */

    const pj = applyVersionsToPackage(release.workspace.pkg, releases)
    const updated = writePackage(release.workspace.path, pj)

    if (updated.status === 'err') {
      return {
        status: 'err',
        message: `Error writing package.json: ${updated.message}`,
      }
    }

    /* Authenticate */

    const authentication = auth(
      release.workspace.path,
      options.registry,
      options.token,
    )

    if (authentication.status === 'err') {
      return {
        status: 'err',
        message: `Error authenticating: ${authentication.message}`,
      }
    }

    /* Publish */

    execa('npm', ['publish', '--registry', options.registry], {
      cwd: release.workspace.path,
    })

    return { status: 'ok', release: release }
  } catch (err) {
    return { status: 'err', message: err.message }
  }

  /* Helper functions */

  /**
   * Taken from npm/cli.
   *
   * Maps a URL to an identifier.
   *
   * Name courtesy schiffertronix media LLC, a New Jersey corporation
   *
   * @param {String} uri The URL to be nerfed.
   * @returns {String} A nerfed URL.
   */
  function toNerfDart(uri: string): string {
    var parsed = url.parse(uri)
    delete parsed.protocol
    delete parsed.auth
    delete parsed.query
    delete parsed.search
    delete parsed.hash

    return url.resolve(url.format(parsed), '.')
  }

  /**
   *
   * Composes a npmrc file with auth.
   *
   * @param pkgPath
   * @param registry
   * @param token
   */
  function auth(
    pkgPath: string,
    registry: string,
    token: string,
  ): { status: 'ok' } | { status: 'err'; message: string } {
    const npmrcPath = path.resolve(pkgPath, '.npmrc')
    try {
      const npmrc = `${toNerfDart(registry)}:_authToken = ${token}`
      fs.writeFileSync(npmrcPath, npmrc)

      return { status: 'ok' }
    } catch (err) {
      return { status: 'err', message: err.message }
    }
  }
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
