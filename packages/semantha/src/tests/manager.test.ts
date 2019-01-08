import { manage } from '../manager'

import * as semantha from 'semantha-core'
import * as configuration from '../config'
import * as npm from '../npm'
import * as version from '../version'

describe('manager', () => {
  beforeEach(() => {
    beforeEach(() => {
      jest.restoreAllMocks()
      jest.resetModules()

      delete process.env.GITHUB_TOKEN
      delete process.env.GITHUB_BRANCH
    })
  })
  test('manager reports missing Github token', async () => {
    /* Mocks */

    const getConfigurationFromMock = jest
      .spyOn(configuration, 'getConfigurationFrom')
      .mockImplementation(() => {})
    const getCommitsSinceLastReleaseMock = jest
      .spyOn(semantha, 'getCommitsSinceLastRelease')
      .mockImplementation(() => {})
    const analyzeCommits = jest
      .spyOn(semantha, 'analyzeCommits')
      .mockImplementation(() => {})
    const prepareWorkspace = jest
      .spyOn(version, 'prepareWorkspace')
      .mockImplementation(() => {})
    const publishMock = jest.spyOn(npm, 'publish').mockImplementation(() => {})

    /* Execution*/

    const res = await manage('', { dryRun: false })

    /* Tests */

    expect(res).toEqual({
      status: 'err',
      message: 'Missing Github credentials!',
    })

    expect(getConfigurationFromMock).toBeCalledTimes(0)
    expect(getCommitsSinceLastReleaseMock).toBeCalledTimes(0)
    expect(analyzeCommits).toBeCalledTimes(0)
    expect(prepareWorkspace).toBeCalledTimes(0)
    expect(publishMock).toBeCalledTimes(0)
  })

  test('Manager correctly reports error in configuration', async () => {
    process.env.GITHUB_TOKEN = 'github-token'

    /* Mocks */

    const getConfigurationFromMock = jest
      .spyOn(configuration, 'getConfigurationFrom')
      .mockResolvedValue({ status: 'err', message: 'pass' })
    const getCommitsSinceLastReleaseMock = jest
      .spyOn(semantha, 'getCommitsSinceLastRelease')
      .mockImplementation(() => {})
    const analyzeCommits = jest
      .spyOn(semantha, 'analyzeCommits')
      .mockImplementation(() => {})
    const prepareWorkspace = jest
      .spyOn(version, 'prepareWorkspace')
      .mockImplementation(() => {})
    const publishMock = jest.spyOn(npm, 'publish').mockImplementation(() => {})

    /* Execution */

    const res = await manage('', { dryRun: false })

    /* Tests */

    expect(res).toEqual({
      status: 'err',
      message: 'pass',
    })
    expect(getConfigurationFromMock).toBeCalledTimes(1)
    expect(getCommitsSinceLastReleaseMock).toBeCalledTimes(0)
    expect(analyzeCommits).toBeCalledTimes(0)
    expect(prepareWorkspace).toBeCalledTimes(0)
    expect(publishMock).toBeCalledTimes(0)
  })

  test('Manager correctly reports error in fetching commits', async () => {
    process.env.GITHUB_TOKEN = 'github-token'

    /* Mocks */

    const getConfigurationFromMock = jest
      .spyOn(configuration, 'getConfigurationFrom')
      .mockResolvedValue({
        status: 'ok',
        config: {
          repository: {
            owner: 'maticzav',
            repo: 'semantha',
          },
        },
      })
    const getCommitsSinceLastReleaseMock = jest
      .spyOn(semantha, 'getCommitsSinceLastRelease')
      .mockResolvedValue({
        status: 'err',
        message: 'pass',
      })
    const analyzeCommits = jest
      .spyOn(semantha, 'analyzeCommits')
      .mockImplementation(() => {})
    const prepareWorkspace = jest
      .spyOn(version, 'prepareWorkspace')
      .mockImplementation(() => {})
    const publishMock = jest.spyOn(npm, 'publish').mockImplementation(() => {})

    /* Execution */

    const res = await manage('', { dryRun: false })

    /* Tests */

    expect(res).toEqual({
      status: 'err',
      message: 'pass',
    })
    expect(getConfigurationFromMock).toBeCalledTimes(1)
    expect(getCommitsSinceLastReleaseMock).toBeCalledTimes(1)
    expect(analyzeCommits).toBeCalledTimes(0)
    expect(prepareWorkspace).toBeCalledTimes(0)
    expect(publishMock).toBeCalledTimes(0)
  })

  test('Manager correctly reports error in preparing workspaces', async () => {
    process.env.GITHUB_TOKEN = 'github-token'

    /* Mocks */

    const getConfigurationFromMock = jest
      .spyOn(configuration, 'getConfigurationFrom')
      .mockResolvedValue({
        status: 'ok',
        config: {
          repository: {
            owner: 'maticzav',
            repo: 'semantha',
          },
        },
      })
    const getCommitsSinceLastReleaseMock = jest
      .spyOn(semantha, 'getCommitsSinceLastRelease')
      .mockResolvedValue({
        status: 'ok',
        commits: [],
      })
    const analyzeCommits = jest
      .spyOn(semantha, 'analyzeCommits')
      .mockReturnValue(['release', 'release', 'release'])
    const prepareWorkspace = jest
      .spyOn(version, 'prepareWorkspace')
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })
      .mockReturnValueOnce({
        status: 'err',
        message: 'err-1',
      })
      .mockReturnValueOnce({
        status: 'err',
        message: 'err-2',
      })
    const publishMock = jest.spyOn(npm, 'publish').mockImplementation(() => {})

    /* Execution */

    const res = await manage('', { dryRun: false })

    /* Tests */

    expect(res).toEqual({
      status: 'err',
      message: 'err-1\nerr-2',
    })
    expect(getConfigurationFromMock).toBeCalledTimes(1)
    expect(getCommitsSinceLastReleaseMock).toBeCalledTimes(1)
    expect(analyzeCommits).toBeCalledTimes(1)
    expect(prepareWorkspace).toBeCalledTimes(3)
    expect(publishMock).toBeCalledTimes(0)
  })

  test('Manager correctly reports error in publish workspaces', async () => {
    process.env.GITHUB_TOKEN = 'github-token'

    /* Mocks */

    const getConfigurationFromMock = jest
      .spyOn(configuration, 'getConfigurationFrom')
      .mockResolvedValue({
        status: 'ok',
        config: {
          repository: {
            owner: 'maticzav',
            repo: 'semantha',
          },
        },
      })
    const getCommitsSinceLastReleaseMock = jest
      .spyOn(semantha, 'getCommitsSinceLastRelease')
      .mockResolvedValue({
        status: 'ok',
        commits: [],
      })
    const analyzeCommits = jest
      .spyOn(semantha, 'analyzeCommits')
      .mockReturnValue(['release', 'release', 'release'])
    const prepareWorkspace = jest
      .spyOn(version, 'prepareWorkspace')
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })
    const publishMock = jest
      .spyOn(npm, 'publish')
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })
      .mockReturnValueOnce({
        status: 'err',
        message: 'err-1',
      })
      .mockReturnValueOnce({
        status: 'err',
        message: 'err-2',
      })

    /* Execution */

    const res = await manage('', { dryRun: false })

    /* Tests */

    expect(res).toEqual({
      status: 'err',
      message: 'err-1\nerr-2',
    })
    expect(getConfigurationFromMock).toBeCalledTimes(1)
    expect(getCommitsSinceLastReleaseMock).toBeCalledTimes(1)
    expect(analyzeCommits).toBeCalledTimes(1)
    expect(prepareWorkspace).toBeCalledTimes(3)
    expect(publishMock).toBeCalledTimes(3)
  })

  test('Manager correctly performs a dryrun in workspace publishing', async () => {
    process.env.GITHUB_TOKEN = 'github-token'

    /* Mocks */

    const getConfigurationFromMock = jest
      .spyOn(configuration, 'getConfigurationFrom')
      .mockResolvedValue({
        status: 'ok',
        config: {
          repository: {
            owner: 'maticzav',
            repo: 'semantha',
          },
        },
      })
    const getCommitsSinceLastReleaseMock = jest
      .spyOn(semantha, 'getCommitsSinceLastRelease')
      .mockResolvedValue({
        status: 'ok',
        commits: [],
      })
    const analyzeCommits = jest
      .spyOn(semantha, 'analyzeCommits')
      .mockReturnValue(['release', 'release', 'release'])
    const prepareWorkspace = jest
      .spyOn(version, 'prepareWorkspace')
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })
    const publishMock = jest
      .spyOn(npm, 'publish')
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })

    /* Execution */

    const res = await manage('', { dryRun: true })

    /* Tests */

    expect(res).toEqual({
      status: 'ok',
      report: {
        configuration: { repository: { owner: 'maticzav', repo: 'semantha' } },
        releases: ['release', 'release', 'release'],
      },
    })
    expect(getConfigurationFromMock).toBeCalledTimes(1)
    expect(getCommitsSinceLastReleaseMock).toBeCalledTimes(1)
    expect(analyzeCommits).toBeCalledTimes(1)
    expect(prepareWorkspace).toBeCalledTimes(0)
    expect(publishMock).toBeCalledTimes(0)
  })

  test('Manager correctly manages workspace publishing', async () => {
    process.env.GITHUB_TOKEN = 'github-token'

    /* Mocks */

    const getConfigurationFromMock = jest
      .spyOn(configuration, 'getConfigurationFrom')
      .mockResolvedValue({
        status: 'ok',
        config: {
          repository: {
            owner: 'maticzav',
            repo: 'semantha',
          },
        },
      })
    const getCommitsSinceLastReleaseMock = jest
      .spyOn(semantha, 'getCommitsSinceLastRelease')
      .mockResolvedValue({
        status: 'ok',
        commits: [],
      })
    const analyzeCommits = jest
      .spyOn(semantha, 'analyzeCommits')
      .mockReturnValue(['release', 'release', 'release'])
    const prepareWorkspace = jest
      .spyOn(version, 'prepareWorkspace')
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })
    const publishMock = jest
      .spyOn(npm, 'publish')
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })
      .mockReturnValueOnce({
        status: 'ok',
        release: 'release',
      })

    /* Execution */

    const res = await manage('', { dryRun: false })

    /* Tests */

    expect(res).toEqual({
      status: 'ok',
      report: {
        configuration: { repository: { owner: 'maticzav', repo: 'semantha' } },
        releases: ['release', 'release', 'release'],
      },
    })
    expect(getConfigurationFromMock).toBeCalledTimes(1)
    expect(getCommitsSinceLastReleaseMock).toBeCalledTimes(1)
    expect(analyzeCommits).toBeCalledTimes(1)
    expect(prepareWorkspace).toBeCalledTimes(3)
    expect(publishMock).toBeCalledTimes(3)
  })
})
