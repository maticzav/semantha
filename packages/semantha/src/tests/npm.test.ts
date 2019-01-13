import * as fs from 'fs'
import * as path from 'path'

import { loadPackage, applyVersionsToPackage } from '../npm'
import { SemanthaRelease } from 'semantha-core'

describe('npm', () => {
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

  test('applyVersionToPackage correctly updates package.json', async () => {
    const pkgPath = path.resolve(__dirname, './__fixtures__/packages/valid/')
    const pkg = await loadPackage(pkgPath)

    if (pkg.status === 'err') {
      fail()
      return
    }

    const releases: SemanthaRelease[] = [
      {
        impactingCommits: [],
        releaseType: { type: 'major' },
        workspace: {
          path: '/path',
          pkg: {
            name: 'package',
            version: '1.0.0',
            dependencies: [],
          },
        },
      },
      {
        impactingCommits: [],
        releaseType: { type: 'major' },
        workspace: {
          path: '/path',
          pkg: {
            name: 'test-dependency-a',
            version: '1.0.0',
            dependencies: [],
          },
        },
      },
      {
        impactingCommits: [],
        releaseType: { type: 'ignore' },
        workspace: {
          path: '/path',
          pkg: {
            name: 'test-dependency-b',
            version: '1.0.0',
            dependencies: [],
          },
        },
      },
      {
        impactingCommits: [],
        releaseType: { type: 'prerelease', tag: 'alpha' },
        workspace: {
          path: '/path',
          pkg: {
            name: 'test-dependency-c',
            version: '1.0.0',
            dependencies: [],
          },
        },
      },
    ]

    const updated = applyVersionsToPackage(pkg.pkg, releases)

    expect(updated).toMatchSnapshot()
  })
})
