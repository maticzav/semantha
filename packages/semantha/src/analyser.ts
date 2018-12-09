import { Workspace } from './workspaces'
import { GithubCommit } from './github'

export interface Release {
  status: 'major' | 'minor' | 'patch' | 'ignore'
  workspace: Workspace
  commits: GithubCommit[]
}

/**
 *
 * Analyze commits analyzes commits and their commit messages to find
 * the new version of workspace packages.
 *
 * @param workspaces
 * @param commits
 */
export function analyzeCommits(
  workspaces: Workspace[],
  commits: GithubCommit[],
): Release[] {
  /** Bind commits to workspace */
  const workspacesWithImpactingCommits = workspaces.map(workspace =>
    findWorkspaceImpactingCommits(workspace),
  )

  /** Calculate next version from commit messages */
  const releasesFromCommitMessages = workspacesWithImpactingCommits.map(
    workspaceWitnImpactingCommits =>
      analyseCommitMessages(workspaceWitnImpactingCommits),
  )

  /** Accounts for changes in peer dependencies */
  const releasesFromDependencies = releasesFromCommitMessages.map(
    releaseFromCommitMessages =>
      analyseDependecyVersioning(
        releaseFromCommitMessages,
        releasesFromCommitMessages,
      ),
  )

  return releasesFromDependencies

  /**
   * Helper functions
   */
  /**
   *
   * Find commits which impacted files in the workspace path.
   *
   * @param workspace
   */
  function findWorkspaceImpactingCommits(
    workspace: Workspace,
  ): { workspace: Workspace; commits: GithubCommit[] } {
    const impactingCommits = commits.filter(commit =>
      commit.files.some(file => file.filename.startsWith(workspace.path)),
    )

    return {
      workspace: workspace,
      commits: impactingCommits,
    }
  }

  /**
   * Analyses commits messages to determine next version of the package.
   */
  function analyseCommitMessages({
    workspace,
    commits,
  }: {
    workspace: Workspace
    commits: GithubCommit[]
  }): Release {
    const status = analyseCommits(commits)

    return {
      status: status,
      workspace: workspace,
      commits: commits,
    }
  }

  /**
   *
   * Determines the actual version based on dependencies.
   *
   * @param releases
   */
  function analyseDependecyVersioning(
    release: Release,
    releases: Release[],
  ): Release {
    return {
      status: 'major',
      workspace: release.workspace,
      commits: release.commits,
    }
  }
}

/** Taken from semantic-release/commit-analyser */
const releaseRules = [
  { breaking: true, release: 'major' },
  { revert: true, release: 'patch' },
  // Angular
  { type: 'feat', release: 'minor' },
  { type: 'fix', release: 'patch' },
  { type: 'perf', release: 'patch' },
  // Atom
  { emoji: ':racehorse:', release: 'patch' },
  { emoji: ':bug:', release: 'patch' },
  { emoji: ':penguin:', release: 'patch' },
  { emoji: ':apple:', release: 'patch' },
  { emoji: ':checkered_flag:', release: 'patch' },
  // Ember
  { tag: 'BUGFIX', release: 'patch' },
  { tag: 'FEATURE', release: 'minor' },
  { tag: 'SECURITY', release: 'patch' },
  // ESLint
  { tag: 'Breaking', release: 'major' },
  { tag: 'Fix', release: 'patch' },
  { tag: 'Update', release: 'minor' },
  { tag: 'New', release: 'minor' },
  // Express
  { component: 'perf', release: 'patch' },
  { component: 'deps', release: 'patch' },
  // JSHint
  { type: 'FEAT', release: 'minor' },
  { type: 'FIX', release: 'patch' },
]

/**
 *
 * Analyses commits using commit messages.
 *
 * @param commits
 */
function analyseCommits(
  commits: GithubCommit[],
): 'major' | 'minor' | 'patch' | 'ignore' {
  return 'major'
}
