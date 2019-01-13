import Octokit from '@octokit/rest'
import {
  SemanthaRelease,
  SemanthaRule,
  getCommitsSinceLastRelease,
  analyzeCommits,
  getLatestPackageVersionFromGitReleases,
} from 'semantha-core'
import { Configuration, getConfiguration } from './config'
import { publish, loadPackage, Package } from './npm'
import { filterMap } from './utils'

export interface Options {
  dryRun: boolean
  registry?: string
}

export interface Report {
  configuration: Configuration
  releases: SemanthaRelease[]
  options: Options
}

/**
 *
 * Manager
 *
 */

/**
 * release rules define how commits should affect releases.
 */

const releaseRules: SemanthaRule[] = []

/**
 *
 * Manager manges the execution process.
 *
 * @param cwd
 * @param options
 */
export async function manage(
  cwd: string,
  options: Options,
): Promise<
  { status: 'ok'; report: Report } | { status: 'err'; message: string }
> {
  /* Environment */

  if (!process.env.GITHUB_TOKEN) {
    return { status: 'err', message: 'Missing Github credentials!' }
  }

  if (!options.dryRun && !process.env.NPM_TOKEN) {
    return { status: 'err', message: 'Missing NPM credentials!' }
  }

  /* Configuration */

  const configuration = await getConfiguration(cwd)

  if (configuration.status === 'err') {
    return {
      status: 'err',
      message: `Configuration error: ${configuration.message}`,
    }
  }

  /* Github */

  const client = new Octokit()

  client.authenticate({
    type: 'token',
    token: process.env.GITHUB_TOKEN,
  })

  /* Load packages */

  const packages: Array<
    Promise<{ status: 'err'; message: string }>
  > = configuration.config.workspaces.map(async path => {
    const pkg = await loadPackage(path)

    if (pkg.status === 'err') {
      return {
        status: 'err',
        message: `Error loading package: ${pkg.message}`,
      }
    }

    const pkgVersion = await getLatestPackageVersionFromGitReleases(
      client,
      configuration.config.repository,
      pkg.pkg.name,
    )

    if (pkgVersion.status === 'err') {
      return {
        status: 'err',
        message: `Error determining package version: ${pkgVersion.message}`,
      }
    }

    return { status: 'err', message: '' }
  })

  /** Fetch commits from last release */

  const commits = await getCommitsSinceLastRelease(
    client,
    configuration.config.repository,
  )

  if (commits.status !== 'ok') {
    return {
      status: 'err',
      message: `Error loading commits: ${commits.message}`,
    }
  }

  /* Analyzes commits */

  const releases = await analyzeCommits(packages, commits.commits, releaseRules)

  /* Return analysis on dry run */

  if (options.dryRun) {
    return {
      status: 'ok',
      report: {
        configuration: configuration.config,
        releases: releases,
        options: options,
      },
    }
  }

  /* Publish */

  const publishedPackages = releases.map(release =>
    publish(release, { registry: '' }),
  )

  if (publishedPackages.some(pkg => pkg.status !== 'ok')) {
    /* Squashes all error messages into one */
    const message = filterMap(pkg => {
      if (pkg.status === 'ok') {
        return null
      } else {
        return pkg.message
      }
    }, publishedPackages).join('\n')

    return { status: 'err', message: message }
  }

  /* Return report */

  return {
    status: 'ok',
    report: {
      configuration: configuration.config,
      releases: releases,
      options: options,
    },
  }
}
