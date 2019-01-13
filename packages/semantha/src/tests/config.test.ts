import * as path from 'path'
import { getConfiguration } from '..'

describe('configuration', () => {
  test('getConfiguration reports missing repository configuration', async () => {
    const cwd = path.resolve(__dirname, './__fixtures__/config/no-repository/')
    const config = await getConfiguration(cwd)

    expect(config).toEqual({
      status: 'err',
      message: 'Missing workspaces or repository definition in package.json',
    })
  })

  test('getConfiguration reports missing workspaces configuration', async () => {
    const cwd = path.resolve(__dirname, './__fixtures__/config/no-workspaces/')
    const config = await getConfiguration(cwd)

    expect(config).toEqual({
      status: 'err',
      message: 'Missing workspaces or repository definition in package.json',
    })
  })

  test('getConfiguration reports misconfigured repository', async () => {
    const cwd = path.resolve(__dirname, './__fixtures__/config/invalid/')
    const config = await getConfiguration(cwd)

    expect(config).toEqual({
      status: 'err',
      message: `Couldn't parse provided repository faulty repo`,
    })
  })

  test('getConfiguration correctly handles errors', async () => {
    const cwd = path.resolve(__dirname, './__fixtures__/config/whatever/')
    const workspaces = await getConfiguration(cwd)

    /* Tests */

    expect(workspaces).toEqual({
      status: 'err',
      message: `ENOENT: no such file or directory, open '${cwd}/package.json'`,
    })
  })

  test('getConfiguration errors on no-workspace matches', async () => {
    const cwd = path.resolve(__dirname, './__fixtures__/config/no-matches/')
    const workspaces = await getConfiguration(cwd)

    /* Tests */

    expect(workspaces).toEqual({
      status: 'err',
      message: "Couldn't find any workspace.",
    })
  })

  test('getConfiguration loads correct configuration', async () => {
    const cwd = path.resolve(__dirname, './__fixtures__/config/valid/')
    const config = await getConfiguration(cwd)

    expect(config).toEqual({
      config: {
        repository: {
          owner: 'maticzav',
          repo: 'semantha',
        },
        workspaces: [
          path.resolve(
            __dirname,
            './__fixtures__/config/valid/packages/package-a',
          ),
          path.resolve(
            __dirname,
            './__fixtures__/config/valid/packages/package-b',
          ),
        ],
      },
      status: 'ok',
    })
  })
})
