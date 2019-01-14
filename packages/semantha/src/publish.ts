import * as cp from 'child_process'
import * as fs from 'fs'
// import { sync as execa } from 'execa'
import * as libnpmpublish from 'libnpmpublish'
import _ from 'lodash'
import * as path from 'path'
import {
  SemanthaRelease,
  Dependency,
  getNextVersion,
  Package,
} from 'semantha-core'
import * as tempy from 'tempy'
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

/**
 *
 * Packs package to tmpdir.
 *
 * @param pkgPath
 */
export async function packPackage(
  pkgPath: string,
): Promise<
  { status: 'ok'; path: string } | { status: 'err'; message: string }
> {
  return new Promise((resolve, reject) => {
    try {
      const tmpdir = tempy.directory()

      cp.exec(`npm pack ${pkgPath}`, { cwd: tmpdir }, (err, stdout, stderr) => {
        if (err) {
          reject({ status: 'err', message: err.message })
        } else {
          resolve({ status: 'ok', path: tmpdir })
        }
      })

      return
    } catch (err) {
      reject({ status: 'err', message: err.message })
    }
  })
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
    /* Update package.json for package */
    const pj = applyVersionsToPackage(release.workspace.pkg, releases)
    const parsedPj = JSON.parse(pj)

    /* Write pj to package */
    const updated = writePackage(release.workspace.path, pj)

    if (updated.status === 'err') {
      return {
        status: 'err',
        message: `Error writing package.json: ${updated.message}`,
      }
    }

    /* Pack */

    const pack = await packPackage(release.workspace.path)

    if (pack.status === 'err') {
      return {
        status: 'err',
        message: `Error packing ${release.workspace.pkg.name}: ${pack.message}`,
      }
    }

    /* Publish */

    const tar = fs.createReadStream(pack.path)

    await libnpmpublish.publish(parsedPj, tar, {
      token: options.token,
    })

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
