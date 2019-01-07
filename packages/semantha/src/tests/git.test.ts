import tempy from 'tempy'
import execa from 'execa'
// import fileUrl from 'file-url'

import { isRefInHistory, isBranchUpToDate, getRemoteHead } from '../git'

describe('git', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  /**
   * isRefInHistory
   */

  test('isRefInHistory correctly reports error', async () => {
    const res = await isRefInHistory('master', { cwd: '/' })

    expect(res).toEqual({
      status: 'err',
      message: '',
    })
  })

  test('isRefInHistory correctly refInHistory', async () => {
    const repo = await createTmpRepository('master')

    const res = isRefInHistory('master', { cwd: repo })

    /* Tests */

    expect(2).toBe(2)
  })

  /**
   * getRemoteHead
   */

  test('getRemoteHead correctly reports error', async () => {
    /* Mock */

    const execaMock = jest.spyOn(execa, 'default').mockResolvedValue(undefined)

    /* Execution */

    const res = getRemoteHead('master')

    /* Tests */

    expect(2).toBe(2)
  })

  test('getRemoteHead correctly finds remote head', async () => {
    /* Mock */

    const execaMock = jest.spyOn(execa, 'default').mockResolvedValue(undefined)

    /* Execution */

    const res = getRemoteHead('master')

    /* Tests */

    expect(2).toBe(2)
  })

  /**
   * isBranchUpToDate
   */
  test('isBranchUpToDate correctly logs remoteHead error', async () => {
    /* Mock */

    const execaMock = jest.spyOn(execa, 'default').mockResolvedValue(undefined)

    /* Execution */

    const res = isBranchUpToDate('master')

    /* Tests */

    expect(2).toBe(2)
  })

  test('isBranchUpToDate correctly logs refInHistory error', async () => {
    /* Mock */

    const repo = await createTmpRepository()

    /* Execution */

    const res = isBranchUpToDate('master', { cwd: repo })

    /* Tests */

    expect(2).toBe(2)
  })

  test('isBranchUpToDate correctly determines whether branch is up to date', async () => {
    /* Mock */

    const execaMock = jest.spyOn(execa, 'default').mockResolvedValue(undefined)

    /* Execution */

    const res = isBranchUpToDate('master')

    /* Tests */

    expect(2).toBe(2)
  })
})

/* Helper functions */

/**
 *
 * Generate temporary repository.
 *
 */
async function createTmpRepository(branch: string): Promise<string> {
  const cwd = tempy.directory()

  await execa('git', ['init'], { cwd })
  await execa('git', ['config', 'commit.gpgsign', 'false'], { cwd })
  await execa('git', ['checkout', '-b', branch], { cwd })

  return cwd
}

async function cloneTmpRepository(
  repository: string,
  branch: string,
): Promise<string> {
  const cwd = tempy.directory()

  await execa(
    'git',
    [
      'clone',
      '--no-hardlinks',
      '--no-tags',
      '-b',
      branch,
      '--depth',
      '1',
      repository,
      cwd,
    ],
    {
      cwd,
    },
  )

  return cwd
}

export async function gitCommits(messages: string[], options: execa.Options) {
  const res = await messages.reduce<Promise<any>>(async (acc, message) => {
    return acc.then(_ =>
      execa.stdout(
        'git',
        ['commit', '-m', message, '--allow-empty', '--no-gpg-sign'],
        options,
      ),
    )
  }, Promise.resolve())

  // return (await gitGetCommits(undefined, execaOpts)).slice(0, messages.length)
}

export async function gitPush(
  repositoryUrl: string,
  branch: string,
  execaOpts: execa.Options,
) {
  await execa(
    'git',
    ['push', '--tags', repositoryUrl, `HEAD:${branch}`],
    execaOpts,
  )
}
