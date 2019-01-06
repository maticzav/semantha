import { getCommitsSinceLastRelease, GithubRepository } from '../'

describe('github', () => {
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

    expect(res).toEqual(
      new Array(150).fill({
        sha: 'sha',
        message: '',
        body: '',
        files: [
          {
            filename: 'file',
          },
        ],
      }),
    )
    expect(git.repos.getLatestRelease).toBeCalledWith(repository)
    expect(git.repos.getCommit).toBeCalledTimes(150)
    expect(git.repos.getCommit).toBeCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      sha: 'sha',
    })
    expect(git.repos.listCommits).toBeCalledTimes(2)
  })
})
