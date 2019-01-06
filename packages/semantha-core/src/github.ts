import * as Octokit from '@octokit/rest'

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
): Promise<GithubCommit[]> {
  const size = 100

  /** Finds the latest release. */
  const release = await github.repos.getLatestRelease({
    owner: repository.owner,
    repo: repository.repo,
  })

  /** Gathers commits since latest release */
  const commits = await getCommitsSince(release.data.published_at)

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
  async function getCommitsSince(
    since: string,
    page: number = 1,
  ): Promise<Octokit.ReposListCommitsResponseItem[]> {
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
 * Obtains the head of the remote repository.
 *
 * @param github
 * @param repository
 * @param branch
 */
export async function getRepositoryBranchRemoteHead(
  github: Octokit,
  repository: GithubRepository,
  branch: string,
): Promise<string | null> {
  return github.repos
    .getBranch({
      owner: repository.owner,
      repo: repository.repo,
      branch: branch,
    })
    .then(res => {
      if (res.status === 200) {
        return res.data.commit.sha
      }
      return null
    })
}
