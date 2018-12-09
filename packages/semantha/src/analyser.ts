import { Workspace } from './workspaces'
import { GithubCommit } from './github'

export interface Release {
  status: 'major' | 'minor' | 'patch'
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

  /** Calculate next version from commits */
  const releasesFromCommitMessages = workspacesWithImpactingCommits.map(
    workspaceWitnImpactingCommits =>
      analyseCommitMessages(workspaceWitnImpactingCommits),
  )

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
    return {
      status: 'major',
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
