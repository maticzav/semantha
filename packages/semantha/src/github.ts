import * as parseGithubUrl from 'parse-github-url'
import * as Octokit from '@octokit/rest'

export interface GithubRepository {
  owner: string
  repo: string
}

/**
 *
 * Obtains repository information from repository URL.
 *
 * @param url
 */
export function getRepositoryFromURL(
  url: string,
): { status: 'ok'; repo: GithubRepository } | { status: 'err' } {
  try {
    const repository = parseGithubUrl(url)

    if (repository && repository.owner && repository.repo) {
      return {
        status: 'ok',
        repo: { owner: repository.owner, repo: repository.repo },
      }
    } else {
      return { status: 'err' }
    }
  } catch (err) {
    return { status: 'err' }
  }
}

export interface GithubCommit {
  sha: string
  message: string
  body: string
  files: string[]
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
): Promise<GithubCommit[]> {
  const size = 100

  /** Finds the latest release. */
  const release = await github.repos.getLatestRelease({
    owner: repository.owner,
    repo: repository.repo,
  })

  /** Gathers commits since latest release */
  const commits = await getCommits()

  /** Hydrate commit information */
  const hydratedCommits = Promise.all(
    commits.map(commit => hydrateCommit(commit.sha)),
  )

  return hydratedCommits

  /**
   * Helper functions
   */
  /**
   *
   * Obtains all commits since last release.
   *
   * @param page
   */
  async function getCommits(
    page: number = 1,
  ): Promise<Octokit.ReposListCommitsResponseItem[]> {
    return github.repos
      .listCommits({
        since: release.data.published_at,
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
          const remainingCommits = await getCommits(page + 1)

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
        files: res.data.files.map(file => file.filename),
      }))
  }
}
