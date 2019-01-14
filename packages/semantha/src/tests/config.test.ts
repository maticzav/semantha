import * as fs from 'fs'
import * as path from 'path'
import { getConfiguration, loadPackage } from '..'

describe('get configuration', () => {
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

describe('load package', () => {
  test('loadPackage reports missing name', async () => {
    const pkgPath = path.resolve(
      __dirname,
      './__fixtures__/packages/invalid-name',
    )
    const pkg = await loadPackage(pkgPath)

    expect(pkg).toEqual({
      status: 'err',
      message: 'Missing package definition.',
    })
  })
  test('loadPackage reports missing version', async () => {
    const pkgPath = path.resolve(
      __dirname,
      './__fixtures__/packages/invalid-version',
    )
    const pkg = await loadPackage(pkgPath)

    expect(pkg).toEqual({
      status: 'err',
      message: 'Missing package definition.',
    })
  })

  test('loadPackage correctly reports error', async () => {
    const pkgPath = path.resolve(__dirname, './__fixtures__/packages/whatever')
    const pkg = await loadPackage(pkgPath)

    expect(pkg).toEqual({
      status: 'err',
      message: `Couldn't load package: ENOENT: no such file or directory, open '/Users/maticzavadlal/Code/sandbox/semantha/packages/semantha/src/tests/__fixtures__/packages/whatever/package.json'`,
    })
  })

  test('loadPackage correctly loads package', async () => {
    const pkgPath = path.resolve(__dirname, './__fixtures__/packages/valid')
    const pkg = await loadPackage(pkgPath)

    expect(pkg).toEqual({
      status: 'ok',
      pkg: {
        raw: fs.readFileSync(`${pkgPath}/package.json`, 'utf-8'),
        name: 'package',
        version: '0.0.0-semantha',
        dependencies: [
          {
            name: 'test-dependency-a',
            version: '0.0.0-semantha',
            type: 'dependencies',
          },
          {
            name: 'irrelevant',
            version: '2.0.0',
            type: 'dependencies',
          },
          {
            name: 'test-dependency-b',
            version: '0.0.0-semantha',
            type: 'devDependencies',
          },
          {
            name: 'test-dependency-c',
            version: '0.0.0-semantha',
            type: 'devDependencies',
          },
        ],
      },
    })
  })
})
