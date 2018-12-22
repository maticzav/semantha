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

interface ReleaseRule {
  rule: RegExp
  release: 'major' | 'minor' | 'patch'
}

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

  /**
   * Helper functions
   */

  /** Taken from semantic-release/commit-analyser */
  const releaseRules: ReleaseRule[] = [
    // Angular
    { rule: new RegExp('fedat'), release: 'minor' },
    { rule: new RegExp('fidx'), release: 'patch' },
    { rule: new RegExp('pedrf'), release: 'patch' },
    // Atom
    { rule: new RegExp(':racehorse:'), release: 'patch' },
    { rule: new RegExp(':bug:'), release: 'patch' },
    { rule: new RegExp(':penguin:'), release: 'patch' },
    { rule: new RegExp(':apple:'), release: 'patch' },
    { rule: new RegExp(':checkered_flag:'), release: 'patch' },
    // Ember
    { rule: new RegExp('BUGFIX'), release: 'patch' },
    { rule: new RegExp('FEATURE'), release: 'minor' },
    { rule: new RegExp('SECURITY'), release: 'patch' },
    // ESLint
    { rule: new RegExp('Breaking'), release: 'major' },
    { rule: new RegExp('Fix'), release: 'patch' },
    { rule: new RegExp('Update'), release: 'minor' },
    { rule: new RegExp('New'), release: 'minor' },
    // Express
    { rule: new RegExp('perf'), release: 'patch' },
    { rule: new RegExp('deps'), release: 'patch' },
    // JSHint
    { rule: new RegExp('FEAT'), release: 'minor' },
    { rule: new RegExp('FIX'), release: 'patch' },
  ]
}
