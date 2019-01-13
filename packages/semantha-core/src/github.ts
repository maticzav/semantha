import * as Octokit from '@octokit/rest'
import * as semver from 'semver'

import { SemanthaRelease } from './analyser'
import { generateChangelog } from './changelog'
import { filterMap } from './utils'
import { getNextVersion } from './version'

export interface GithubRepository {
  owner: string
  repo: string
}

export interface GithubCommit {
  sha: string
  message: string
  body: string
  files: GithubFile[]
}

export interface GithubFile {
  filename: string
}

/**
 *
 * Obtains all commits since the latest release of module.
 *
 * @param github
 * @param repository
 */
export async function getCommitsSinceLastRelease(
  github: Octokit,
  repository: GithubRepository,
): Promise<
  { status: 'ok'; commits: GithubCommit[] } | { status: 'err'; message: string }
> {
  try {
    /** Finds the latest release. */
    const release = await github.repos.getLatestRelease(repository)

    /** Gathers commits since latest release */
    const commits = await getCommitsSince(release.data.published_at)

    /** Hydrate commit information */
    const hydratedCommits = await Promise.all(
      commits.map(commit => hydrateCommit(commit.sha)),
    )

    return { status: 'ok', commits: hydratedCommits }
  } catch (err) {
    return { status: 'err', message: err.message }
  }

  /**
   * Helper functions
   */
  /**
   *
   * Obtains all commits since last release.
   *
   * @param page
   */
  async function getCommitsSince(
    since: string,
    page: number = 1,
  ): Promise<Octokit.ReposListCommitsResponseItem[]> {
    const size = 100

    return github.repos
      .listCommits({
        since: since,
        owner: repository.owner,
        repo: repository.repo,
        page: page,
        per_page: size,
      })
      .then(async res => {
        /** Recursively paginate thorough all commits */
        if (res.data.length < size) {
          return res.data
        } else {
          const remainingCommits = await getCommitsSince(since, page + 1)

          return [...res.data, ...remainingCommits]
        }
      })
  }

  /**
   *
   * Hydrates commit with filechanges information and message.
   *
   * @param sha
   */
  async function hydrateCommit(sha: string): Promise<GithubCommit> {
    return github.repos
      .getCommit({
        owner: repository.owner,
        repo: repository.repo,
        sha: sha,
      })
      .then(res => ({
        sha: res.data.sha,
        message: res.data.commit.message,
        body: res.data.commit.message,
        files: res.data.files,
      }))
  }
}

/**
 *
 * Creates a Github release from SemanthaRelease
 *
 * @param github
 * @param repository
 * @param release
 */
export async function createGithubRelease(
  github: Octokit,
  repository: GithubRepository,
  release: SemanthaRelease,
): Promise<{}> {
  const version = getNextVersion(release)
  const tag = `${release.workspace.pkg.name}@${version}`
  const changelog = generateChangelog(release)

  return github.repos.createRelease({
    owner: repository.owner,
    repo: repository.repo,
    name: tag,
    body: changelog,
    tag_name: tag,
  })
}

/**
 *
 * Finds the latest released version of a package from published Github tags.
 *
 * @param github
 * @param repository
 * @param pkg
 */
export async function getLatestPackageVersionFromGitReleases(
  github: Octokit,
  repository: GithubRepository,
  pkg: string,
  page = 0,
): Promise<
  { status: 'ok'; latestVersion: string } | { status: 'err'; message: string }
> {
  const firstVersion = '0.0.0'
  const releasesPerPage = 50

  const releases = await github.repos.listReleases({
    repo: repository.repo,
    owner: repository.owner,
    page: page,
    per_page: releasesPerPage,
  })

  if (releases.status !== 200) {
    return { status: 'err', message: 'There was a problem accessing Github.' }
  }

  /**
   * Parse tags and remove ones which don't follow
   * semantic release conventions or do not impact the investigated
   * package.
   */
  const releasedVersions = filterMap(release => {
    if (release.tag_name.startsWith(`${pkg}@`)) {
      return semver.valid(release.tag_name.replace(`${pkg}@`, ''))
    } else {
      return null
    }
  }, releases.data)

  /**
   * Recursively finds latest version by comparing current version
   * with investigated one, starting from constants.firstVersion.
   */
  const latestVersion = releasedVersions.reduce(
    (acc, version) => semver.maxSatisfying([acc, version], '*'),
    firstVersion,
  )

  /**
   * Tries to recursively find last version by examining more releases
   * in case latest calculated version equals first version and there
   * exist more releases then examined.
   */
  if (
    latestVersion === firstVersion &&
    releases.data.length === releasesPerPage
  ) {
    return getLatestPackageVersionFromGitReleases(
      github,
      repository,
      pkg,
      page + 1,
    )
  } else {
    return { status: 'ok', latestVersion: latestVersion }
  }
}

// /**
//  *
//  * Obtains the head of the remote repository.
//  *
//  * @param github
//  * @param repository
//  * @param branch
//  */
// export async function getRepositoryBranchRemoteHead(
//   github: Octokit,
//   repository: GithubRepository,
//   branch: string,
// ): Promise<string | null> {
//   return github.repos
//     .getBranch({
//       owner: repository.owner,
//       repo: repository.repo,
//       branch: branch,
//     })
//     .then(res => {
//       if (res.status === 200) {
//         return res.data.commit.sha
//       }
//       return null
//     })
// }
