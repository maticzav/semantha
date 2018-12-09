import * as Octokit from '@octokit/rest'

export interface GithubCommit {
  sha: string
  message: string
  body: string
  files: string[]
}

export interface Workspace {
  path: string
}

export function analyzeCommits(
  workspaces: Workspace[],
  commits: GithubCommit[],
): {}
