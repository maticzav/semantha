import * as fs from 'fs'
import * as path from 'path'
import { SemanthaRelease } from 'semantha-core'

import { loadPackage } from '../config'
import { applyVersionsToPackage, writePackage } from '../publish'

describe('write package', () => {
  test('reports error', async () => {
    const pkgPath = path.resolve(__dirname, './__fixtures__/packages/random/')
    const res = writePackage(pkgPath, 'hey')

    const pjPath = path.resolve(pkgPath, 'package.json')

    expect(res).toEqual({
      status: 'err',
      message: `ENOENT: no such file or directory, open '${pjPath}'`,
    })
  })

  test('correctly updates package.json', async () => {
    const pkgPath = path.resolve(__dirname, './__fixtures__/packages/write/')
    const res = writePackage(pkgPath, '{ "name": "package" }')

    expect(res).toEqual({
      status: 'ok',
    })
    expect(
      fs.readFileSync(path.resolve(pkgPath, 'package.json'), 'utf-8'),
    ).toBe('{ "name": "package" }')
  })
})

describe('applyVersionToPackage', () => {
  test('correctly updates package.json', async () => {
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
            raw: '',
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
            raw: '',
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
            raw: '',
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
            raw: '',
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
