import { GithubCommit } from './github'
import { constants, SemanthaVersion } from './constants'
import { filterMap } from './utils'

export interface Package {
  name: string
  version: string
  dependencies: { [dependency: string]: string }
  devDependencies: { [dependency: string]: string }
}

export interface Workspace {
  path: string
  pkg: Package
}

export interface SemanthaRule {
  regex: RegExp
  release: SemanthaVersion
}

export interface SemanthaRelease {
  version: SemanthaVersion
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
  rules: SemanthaRule[],
): SemanthaRelease[] {
  /** Bind commits to workspace */
  const workspacesWithImpactingCommits = workspaces.map(workspace =>
    findWorkspaceImpactingCommits(workspace),
  )

  /** Calculate next version from commit messages */
  const workspaceVersionsFromCommitMessages = workspacesWithImpactingCommits.map(
    workspaceWitnImpactingCommits =>
      analyseCommitMessages(workspaceWitnImpactingCommits),
  )

  /** Accounts for changes in peer dependencies */
  const workspaceVersionsFromDependencies = workspaceVersionsFromCommitMessages.map(
    releaseFromCommitMessages =>
      analyseDependecyVersioning(
        releaseFromCommitMessages,
        workspaceVersionsFromCommitMessages,
      ),
  )

  return workspaceVersionsFromDependencies

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
  }): SemanthaRelease {
    const version = rules.reduce((acc, rule) => {
      if (
        commits.some(commit => rule.regex.test(commit.message)) &&
        rule.release > acc
      ) {
        return rule.release
      } else {
        return acc
      }
    }, constants.IGNORE)

    return {
      version: version,
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
    release: SemanthaRelease,
    releases: SemanthaRelease[],
    path: string[] = [],
  ): SemanthaRelease {
    /* Merge all dependencies of a workspace */
    const dependencies: { [name: string]: string } = {
      ...release.workspace.pkg.dependencies,
      ...release.workspace.pkg.devDependencies,
    }

    /* Find related releases */
    const peerReleases = filterMap(
      dependency =>
        releases.find(release => release.workspace.pkg.name === dependency),
      Object.keys(dependencies),
    )

    /* Analyse releases */
    const version = peerReleases.reduce((acc, release) => {
      /* Path doesn't yet include the observed workspace. */
      if (!path.includes(release.workspace.pkg.name)) {
        /* Calculate dependency version */
        const dependency = analyseDependecyVersioning(release, releases, [
          ...path,
          release.workspace.pkg.name,
        ])

        /* Update versioning if it impacts the current package */
        if (dependency.version > acc) {
          return dependency.version
        } else {
          return acc
        }
      } else {
        /* Break circular dependencies. */
        return acc
      }
    }, release.version)

    return {
      version: version,
      workspace: release.workspace,
      commits: release.commits,
    }
  }
}
