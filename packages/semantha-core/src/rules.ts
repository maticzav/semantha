// import { GithubCommit } from './github'

export interface SemanthaRule {
  regex: RegExp
  releaseType: SemanthaReleaseType
  // getChangelogGroup: (commit: GithubCommit) => Promise<string | null>
  // getChangelogMessage: (commit: GithubCommit) => Promise<string>
}

export type SemanthaReleaseType =
  | { type: 'major' }
  | { type: 'premajor'; tag: string }
  | { type: 'minor' }
  | { type: 'preminor'; tag: string }
  | { type: 'patch' }
  | { type: 'prepatch'; tag: string }
  | { type: 'prerelease'; tag: string }
  | { type: 'ignore' }

export const releaseTypes: {
  [releaseType in SemanthaReleaseType['type']]: number
} = {
  ignore: 0,
  prerelease: 1,
  prepatch: 2,
  patch: 3,
  preminor: 4,
  minor: 5,
  premajor: 4,
  major: 5,
}
