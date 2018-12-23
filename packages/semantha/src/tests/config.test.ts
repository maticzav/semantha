import * as path from 'path'
import { getConfigurationFrom } from '../config'

describe('configuration functions work as expected', () => {
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

  test('getConfigurationFrom reports invalid workspace configuration', async () => {
    const cwd = path.resolve(__dirname, './__fixtures__/workspaces/invalid/')
    const workspaces = await getConfigurationFrom(cwd)

    /* Tests */

    expect(workspaces).toEqual({
      status: 'err',
      message:
        "ENOENT: no such file or directory, open '/Users/maticzavadlal/Code/sandbox/semantha/packages/semantha/src/tests/__fixtures__/workspaces/invalid/packages/package.json'",
    })
  })

  test('getConfigurationFrom finds correct configuration', async () => {
    const cwd = path.resolve(__dirname, './__fixtures__/workspaces/valid/')
    const config = await getConfigurationFrom(cwd)

    expect(config).toEqual({
      status: 'ok',
      config: {
        repository: {
          owner: 'maticzav',
          repo: 'maticzav/semantha',
        },
        workspaces: [
          {
            path:
              '/Users/maticzavadlal/Code/sandbox/semantha/packages/semantha/src/tests/__fixtures__/workspaces/valid/packages/package-a',
            pkg: {
              _id: 'package-a@0.0.0',
              name: 'package-a',
              version: '0.0.0',
              dependencies: {},
              readme: 'ERROR: No README data found!',
            },
          },
          {
            path:
              '/Users/maticzavadlal/Code/sandbox/semantha/packages/semantha/src/tests/__fixtures__/workspaces/valid/packages/package-b',
            pkg: {
              _id: 'package-b@0.0.0',
              name: 'package-b',
              version: '0.0.0',
              dependencies: {},
              readme: 'ERROR: No README data found!',
            },
          },
          {
            path:
              '/Users/maticzavadlal/Code/sandbox/semantha/packages/semantha/src/tests/__fixtures__/workspaces/valid/packages/package-c',
            pkg: {
              _id: 'package-c@0.0.0',
              name: 'package-c',
              version: '0.0.0',
              dependencies: {},
              readme: 'ERROR: No README data found!',
            },
          },
        ],
      },
    })
  })
})
