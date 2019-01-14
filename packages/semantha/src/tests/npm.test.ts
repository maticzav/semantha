import * as path from 'path'
import { SemanthaRelease } from 'semantha-core'

import { loadPackage } from '../config'
import { applyVersionsToPackage } from '../publish'

describe('npm', () => {
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
