import * as fs from 'fs'
import globby from 'globby'
import Octokit from '@octokit/rest'
import parseGithubUrl from 'parse-github-url'
import * as path from 'path'
import {
  GithubRepository,
  Workspace,
  getLatestPackageVersionFromGitReleases,
} from 'semantha-core'

import { loadPackage } from './npm'

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

export async function loadWorkspace(
  github: Octokit,
  repository: GithubRepository,
  workspace: string,
): Promise<
  { status: 'ok'; workspace: Workspace } | { status: 'err'; message: string }
> {
  const pkg = await loadPackage(workspace)

  if (pkg.status === 'err') {
    return {
      status: 'err',
      message: pkg.message,
    }
  }

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

  return {
    status: 'ok',
    workspace: {
      path: workspace,
      pkg: {
        name: pkg.pkg.name,
        version: latestVersion.latestVersion,
        dependencies: pkg.pkg.dependencies,
      },
    },
  }
}
