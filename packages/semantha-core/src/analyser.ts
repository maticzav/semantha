import { GithubCommit } from './github'
import { releaseTypes, SemanthaVersion } from './constants'
import { filterMap } from './utils'

export type Dependency = {
  name: string
  type:
    | 'dependencies'
    | 'devDependencies'
    | 'optionalDependencies'
    | 'peerDependencies'
    | 'bundleDependencies'
  version: string
}

export interface Package {
  name: string
  version: string
  dependencies: Dependency[]
}

export interface Workspace {
  path: string
  pkg: Package
}

export interface SemanthaRule {
  regex: RegExp
  releaseType: SemanthaVersion
}

export interface SemanthaRelease {
  workspace: Workspace
  releaseType: SemanthaVersion
  impactingCommits: GithubCommit[]
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
  const workspaceReleasesFromCommitMessages = workspacesWithImpactingCommits.map(
    workspaceWitnImpactingCommits =>
      calculateReleaseFromCommits(workspaceWitnImpactingCommits),
  )

  /** Accounts for changes in peer dependencies */
  const workspaceReleasesFromDependencies = workspaceReleasesFromCommitMessages.map(
    releaseFromCommitMessages =>
      calculateReleaseFromDependencies(
        releaseFromCommitMessages,
        workspaceReleasesFromCommitMessages,
      ),
  )

  return workspaceReleasesFromDependencies

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
  function calculateReleaseFromCommits({
    workspace,
    commits,
  }: {
    workspace: Workspace
    commits: GithubCommit[]
  }): SemanthaRelease {
    const calculatedReleaseType = rules.reduce((acc, rule) => {
      /**
       * Try to match all commit rules and apply the highest.
       */
      if (
        commits.some(commit => rule.regex.test(commit.message)) &&
        rule.releaseType > acc
      ) {
        return rule.releaseType
      } else {
        return acc
      }
    }, releaseTypes.IGNORE)

    return {
      workspace: workspace,
      releaseType: calculatedReleaseType,
      impactingCommits: commits,
    }
  }

  /**
   *
   * Recursively determine the actual version of the release by calculting
   * versionTypes of dependencies.
   *
   * @param releases
   */
  function calculateReleaseFromDependencies(
    release: SemanthaRelease,
    releases: SemanthaRelease[],
    tree: string[] = [],
  ): SemanthaRelease {
    /**
     * Finds local dependencies by filter-mapping all package dependencies
     * but only returning the ones which can be found in releases.
     */
    const localDependencies = filterMap(
      dependency =>
        releases.find(
          release => release.workspace.pkg.name === dependency.name,
        ),
      release.workspace.pkg.dependencies,
    )

    /* Analyse releases */

    const calculatedReleaseType = localDependencies.reduce(
      (acc, dependency) => {
        /**
         * Searches the tree to see whether we've come across that dependency
         * or not. This prevents ciruclar dependencies from breaking
         * the calcuation.
         */
        if (!tree.includes(dependency.workspace.pkg.name)) {
          /* Calculate dependency releaseType */
          const dependencyRelease = calculateReleaseFromDependencies(
            dependency,
            releases,
            tree.concat(dependency.workspace.pkg.name),
          )

          /* Update releaseType if it impacts the current package */
          if (dependencyRelease.releaseType > acc) {
            return dependencyRelease.releaseType
          } else {
            return acc
          }
        } else {
          /**
           * Ignore ciruclar dependencies because we've already
           * accounted their version bump once.
           */
          return acc
        }
      },
      release.releaseType,
    )

    return {
      workspace: release.workspace,
      releaseType: calculatedReleaseType,
      impactingCommits: release.impactingCommits,
    }
  }
}
