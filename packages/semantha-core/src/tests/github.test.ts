import { getCommitsSinceLastRelease, GithubRepository } from '../'

import { createGithubRelease } from '../github'
import { SemanthaRelease } from '../analyser'

import * as version from '../version'
import * as changelog from '../changelog'

describe('github', () => {
  test('getCommitsSinceLatestRelease correctly reports error while fetching latest release', async () => {
    /* Mocks */

    const git = {
      repos: {
        getLatestRelease: jest.fn().mockImplementation(() => {
          throw new Error('pass')
        }),
        listCommits: jest.fn().mockResolvedValueOnce({
          data: new Array(50).fill({
            sha: 'sha',
          }),
        }),
        getCommit: jest.fn().mockResolvedValue({
          data: {
            sha: 'sha',
            commit: {
              message: '',
              body: '',
            },
            files: [
              {
                filename: 'file',
              },
            ],
          },
        }),
      },
    }

    /* Execution */

    const repository: GithubRepository = {
      repo: 'test-repo',
      owner: 'test-owner',
    }

    const res = await getCommitsSinceLastRelease(git as any, repository)

    /* Tests */

    expect(res).toEqual({ status: 'err', message: 'pass' })
    expect(git.repos.getLatestRelease).toBeCalledWith(repository)
    expect(git.repos.getLatestRelease).toBeCalledTimes(1)
    expect(git.repos.listCommits).toBeCalledTimes(0)
    expect(git.repos.getCommit).toBeCalledTimes(0)
  })

  test('getCommitsSinceLatestRelease correctly reports error while listing commits', async () => {
    /* Mocks */

    const publishDate = new Date().toDateString()

    const git = {
      repos: {
        getLatestRelease: jest.fn().mockResolvedValue({
          data: {
            published_at: publishDate,
          },
        }),
        listCommits: jest.fn().mockImplementation(() => {
          throw new Error('pass')
        }),
        getCommit: jest.fn().mockResolvedValue({
          data: {
            sha: 'sha',
            commit: {
              message: '',
              body: '',
            },
            files: [
              {
                filename: 'file',
              },
            ],
          },
        }),
      },
    }

    /* Execution */

    const repository: GithubRepository = {
      repo: 'test-repo',
      owner: 'test-owner',
    }

    const res = await getCommitsSinceLastRelease(git as any, repository)

    /* Tests */

    expect(res).toEqual({ status: 'err', message: 'pass' })
    expect(git.repos.getLatestRelease).toBeCalledWith(repository)
    expect(git.repos.getLatestRelease).toBeCalledTimes(1)
    expect(git.repos.listCommits).toBeCalledTimes(1)
    expect(git.repos.getCommit).toBeCalledTimes(0)
  })

  test('getCommitsSinceLatestRelease correctly reports error while listing commits', async () => {
    /* Mocks */

    const publishDate = new Date().toDateString()

    const git = {
      repos: {
        getLatestRelease: jest.fn().mockResolvedValue({
          data: {
            published_at: publishDate,
          },
        }),
        listCommits: jest.fn().mockResolvedValueOnce({
          data: new Array(50).fill({
            sha: 'sha',
          }),
        }),
        getCommit: jest.fn().mockImplementation(() => {
          throw new Error('pass')
        }),
      },
    }

    /* Execution */

    const repository: GithubRepository = {
      repo: 'test-repo',
      owner: 'test-owner',
    }

    const res = await getCommitsSinceLastRelease(git as any, repository)

    /* Tests */

    expect(res).toEqual({ status: 'err', message: 'pass' })
    expect(git.repos.getLatestRelease).toBeCalledWith(repository)
    expect(git.repos.getLatestRelease).toBeCalledTimes(1)
    expect(git.repos.listCommits).toBeCalledTimes(1)
    expect(git.repos.getCommit).toBeCalledTimes(50)
  })

  test('getCommitsSinceLatestRelease finds correct commits', async () => {
    /* Mocks */

    const publishDate = new Date().toDateString()

    const git = {
      repos: {
        getLatestRelease: jest.fn().mockResolvedValue({
          data: {
            published_at: publishDate,
          },
        }),
        listCommits: jest
          .fn()
          .mockResolvedValueOnce({
            data: new Array(100).fill({
              sha: 'sha',
            }),
          })
          .mockResolvedValueOnce({
            data: new Array(50).fill({
              sha: 'sha',
            }),
          }),
        getCommit: jest.fn().mockResolvedValue({
          data: {
            sha: 'sha',
            commit: {
              message: '',
              body: '',
            },
            files: [
              {
                filename: 'file',
              },
            ],
          },
        }),
      },
    }

    /* Execution */

    const repository: GithubRepository = {
      repo: 'test-repo',
      owner: 'test-owner',
    }

    const res = await getCommitsSinceLastRelease(git as any, repository)

    /* Tests */

    expect(res).toEqual({
      status: 'ok',
      commits: new Array(150).fill({
        sha: 'sha',
        message: '',
        body: '',
        files: [
          {
            filename: 'file',
          },
        ],
      }),
    })
    expect(git.repos.getLatestRelease).toBeCalledWith(repository)
    expect(git.repos.getCommit).toBeCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      sha: 'sha',
    })
    expect(git.repos.getLatestRelease).toBeCalledTimes(1)
    expect(git.repos.listCommits).toBeCalledTimes(2)
    expect(git.repos.getCommit).toBeCalledTimes(150)
  })

  test('createGithubRelease correctly creates a Github release', async () => {
    /* Mocks */
    const versionSpy = jest
      .spyOn(version, 'getNextVersion')
      .mockReturnValue('version')
    const changelogSpy = jest
      .spyOn(changelog, 'generateChangelog')
      .mockReturnValue('changelog')

    const git = {
      repos: {
        createRelease: jest.fn().mockReturnValue('pass'),
      },
    }

    const repository: GithubRepository = {
      repo: 'test-repo',
      owner: 'test-owner',
    }

    const _release: SemanthaRelease = {
      impactingCommits: [
        {
          body: '',
          files: [{ filename: '/packages/package-c/package.json' }],
          message: 'feat: Minor change package-c',
          sha: '',
        },
      ],
      releaseType: 2,
      workspace: {
        path: '/packages/package-c',
        pkg: {
          name: 'package-c',
          version: '1.0.0',
          dependencies: [],
        },
      },
    }

    /* Execution */

    const res = await createGithubRelease(git as any, repository, _release)

    /* Tests */

    expect(res).toBe('pass')
    expect(versionSpy).toBeCalledWith(_release)
    expect(changelogSpy).toBeCalledWith(_release)
    expect(git.repos.createRelease).toBeCalledWith({
      owner: repository.owner,
      repo: repository.repo,
      name: `package-c@version`,
      body: 'changelog',
      tag_name: `package-c@version`,
    })
  })
})
