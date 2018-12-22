import * as path from 'path'
import { getConfigurationFrom } from '../config'

describe('configuration functions work as expected', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  test('getConfiguration finds correct configuration', async () => {
    const cwd = path.resolve(__dirname, './__fixtures__/config/valid/')
    const config = await getConfigurationFrom(cwd)

    expect(config).toEqual({
      status: 'ok',
      config: {
        repository: {
          owner: 'maticzav',
          repo: 'maticzav/semantha',
        },
        workspaces: ['packages/*'],
      },
    })
  })

  test('getConfigurationFrom reports missing repository configuration', async () => {
    const cwd = path.resolve(__dirname, './__fixtures__/config/no-repository/')
    const config = await getConfigurationFrom(cwd)

    expect(config).toEqual({
      status: 'err',
      message: 'Missing workspaces or repository definition in package.json',
    })
  })

  test('getConfigurationFrom reports missing workspaces configuration', async () => {
    const cwd = path.resolve(__dirname, './__fixtures__/config/no-workspaces/')
    const config = await getConfigurationFrom(cwd)

    expect(config).toEqual({
      status: 'err',
      message: 'Missing workspaces or repository definition in package.json',
    })
  })

  test('getConfigurationFrom reports faulty repository definition', async () => {
    const cwd = path.resolve(__dirname, './__fixtures__/config/invalid/')
    const config = await getConfigurationFrom(cwd)

    expect(config).toEqual({
      status: 'err',
      message: "Something's wrong with your repository definition.",
    })
  })

  test('getConfigurationFrom reports non-existant configuration', async () => {
    const cwd = path.resolve(__dirname, './__fixtures__/config/doesnnotexist/')
    const config = await getConfigurationFrom(cwd)

    expect(config).toEqual({
      status: 'err',
      message:
        "ENOENT: no such file or directory, open '/Users/maticzavadlal/Code/sandbox/semantha/packages/semantha/src/tests/__fixtures__/config/doesnnotexist/package.json'",
    })
  })
})
