import * as fs from 'fs'
import globby from 'globby'
import Octokit from '@octokit/rest'
import parseGithubUrl from 'parse-github-url'
import * as path from 'path'
import {
  GithubRepository,
  Workspace,
  Package,
  Dependency,
  getLatestPackageVersionFromGitReleases,
} from 'semantha-core'

export interface Configuration {
  repository: GithubRepository
  workspaces: string[]
}

/**
 *
 * Finds Semantha configuration in a particular cwd.
 *
 * @param cwd
 */
export async function getConfiguration(
  cwd: string,
): Promise<
  { status: 'ok'; config: Configuration } | { status: 'err'; message: string }
> {
  try {
    const configPath = path.resolve(cwd, './package.json')
    const rawConfig = fs.readFileSync(configPath, 'utf-8')
    const parsedConfig = JSON.parse(rawConfig)

    /** Find master package.json file */

    if (!parsedConfig.repository || !parsedConfig.workspaces) {
      return {
        status: 'err',
        message: 'Missing workspaces or repository definition in package.json',
      }
    }

    /** Determines repository */

    const repository = parseGithubUrl(parsedConfig.repository)

    if (!repository || !repository.owner || !repository.name) {
      return {
        status: 'err',
        /* prettier-ignore */
        message: `Couldn't parse provided repository ${parsedConfig.repository}`
      }
    }

    /* Finds workspaces */

    const paths = await globby(parsedConfig.workspaces, {
      cwd: cwd,
      onlyDirectories: true,
      gitignore: true,
      absolute: true,
    })

    if (paths.length === 0) {
      return {
        status: 'err',
        message: "Couldn't find any workspace.",
      }
    }

    return {
      status: 'ok',
      config: {
        repository: {
          owner: repository.owner,
          repo: repository.name,
        },
        workspaces: paths,
      },
    }
  } catch (err) {
    return { status: 'err', message: err.message }
  }
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

/**
 *
 * Loads workspace with latest found version from git-releases,
 * parsed package.json file.
 *
 * @param github
 * @param repository
 * @param workspace
 */
export async function loadWorkspace(
  github: Octokit,
  repository: GithubRepository,
  workspace: string,
): Promise<
  { status: 'ok'; workspace: Workspace } | { status: 'err'; message: string }
> {
  /* Parse package */
  const pkg = await loadPackage(workspace)

  if (pkg.status === 'err') {
    return {
      status: 'err',
      message: pkg.message,
    }
  }

  /* Fetch latest version */
  const latestVersion = await getLatestPackageVersionFromGitReleases(
    github,
    repository,
    pkg.pkg.name,
  )

  if (latestVersion.status === 'err') {
    return {
      status: 'err',
      message: latestVersion.message,
    }
  }

  /* Create workspace */

  return {
    status: 'ok',
    workspace: {
      path: workspace,
      pkg: {
        raw: pkg.pkg.raw,
        name: pkg.pkg.name,
        version: latestVersion.latestVersion,
        dependencies: pkg.pkg.dependencies,
      },
    },
  }
}
