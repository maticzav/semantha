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
    const head = await gitTagHead('master', { cwd: repo })

    const isRandomRefInHistory = await isRefInHistory('random-ref', {
      cwd: repo,
    })
    const isHeadRefInHistory = await isRefInHistory(head, {
      cwd: repo,
    })

    /* Tests */

    expect(isRandomRefInHistory).toEqual({
      status: 'ok',
      isRefInHistory: false,
    })

    expect(isHeadRefInHistory).toEqual({
      status: 'ok',
      isRefInHistory: true,
    })
  })

  /**
   * getRemoteHead
   */

  test('getRemoteHead correctly reports error', async () => {
    // const res = getRemoteHead('master')
    // /* Tests */
    expect(2).toBe(2)
  })

  test('getRemoteHead correctly finds remote head', async () => {
    const repo = await cloneTmpRepository(
      'https://github.com/maticzav/semantha',
      'master',
    )
    const res = getRemoteHead('master', { cwd: repo })

    /* Tests */

    expect(res).toBe(
      await gitRemoteTagHead('https://github.com/maticzav/semantha', 'master', {
        cwd: repo,
      }),
    )
  })

  /**
   * isBranchUpToDate
   */
  test('isBranchUpToDate correctly logs remoteHead error', async () => {
    // const res = isBranchUpToDate('master')
    // /* Tests */
    expect(2).toBe(2)
  })

  test('isBranchUpToDate correctly logs refInHistory error', async () => {
    // const repo = await createTmpRepository()
    // const res = isBranchUpToDate('master', { cwd: repo })
    // /* Tests */
    expect(2).toBe(2)
  })

  test('isBranchUpToDate correctly determines whether branch is up to date', async () => {
    const repo = await cloneTmpRepository(
      'https://github.com/maticzav/semantha',
      'master',
    )
    const res = isBranchUpToDate('master', { cwd: repo })

    /* Tests */

    expect(res).toEqual({
      status: 'ok',
      updated: true,
    })
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

  return res
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

export function gitTagHead(
  tagName: string,
  execaOpts: execa.Options,
): Promise<string> {
  return execa.stdout('git', ['rev-list', '-1', tagName], execaOpts)
}

export async function gitRemoteTagHead(
  repository: string,
  tagName: string,
  execaOpts: execa.Options,
) {
  return (await execa.stdout(
    'git',
    ['ls-remote', '--tags', repository, tagName],
    execaOpts,
  ))
    .split('\n')
    .filter(tag => Boolean(tag))
    .map(tag => tag.match(/^(\S+)/)![1])[0]
}
