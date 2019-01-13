import Octokit from '@octokit/rest'
import {
  SemanthaRelease,
  SemanthaRule,
  getCommitsSinceLastRelease,
  analyzeCommits,
  getLatestPackageVersionFromGitReleases,
  Workspace,
} from 'semantha-core'
import { Configuration, getConfiguration, loadWorkspace } from './config'
import { publish, loadPackage, Package } from './npm'
import { mergeErrors } from './utils'

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

  const packages = await Promise.all(
    configuration.config.workspaces.map(workspace =>
      loadWorkspace(client, configuration.config.repository, workspace),
    ),
  )

  if (packages.some(pkg => pkg.status !== 'ok')) {
    return mergeErrors(packages)
  }

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

  const packagesForAnalysis = (packages as {
    status: 'ok'
    workspace: Workspace
  }[]).map(({ workspace }) => workspace)

  const releases = await analyzeCommits(
    packagesForAnalysis,
    commits.commits,
    releaseRules,
  )

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
    return mergeErrors(publishedPackages)
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
