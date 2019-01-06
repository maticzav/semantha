import {
  constants,
  createGithubClient,
  loadWorkspace,
  getCommitsSinceLatestRelease,
  analyzeCommits,
  publishWorkspace,
  SemanthaRule,
  SemanthaWorkspace,
  SemanthaRepository,
} from 'semantha'

const rules: SemanthaRule[] = [
  { regex: new RegExp('fix:'), release: constants.FIX },
  { regex: new RegExp('feat:'), release: constants.MINOR },
  { regex: new RegExp('perf:'), release: constants.MAJOR },
]

const workspaces: SemanthaWorkspace[] = [
  'workspace-a',
  'workspace-b',
  'workspace-c',
].map(loadWorkspace)

const repository: SemanthaRepository = {
  owner: 'maticzav',
  repo: 'semantha',
}

/**
 * Release new version on push
 */
async function release() {
  const git = createGithubClient('token')

  const commits = await getCommitsSinceLatestRelease(git, repository)
  const releases = analyzeCommits(commits, workspaces, rules)

  const reports = await Promise.all(releases.map(publishWorkspace))

  console.log(reports)
}

release()
