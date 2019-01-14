import { getNextVersion } from '../version'
import { SemanthaRelease } from '../analyser'

describe('version', () => {
  test('getNextVersion correctly evaluates next version', async () => {
    const noRelease: SemanthaRelease = {
      impactingCommits: [],
      releaseType: { type: 'ignore' },
      workspace: {
        path: '/packages/package-c',
        pkg: {
          raw: '',
          name: 'package-c',
          version: '1.0.0',
          dependencies: [],
        },
      },
    }

    const preRelease: SemanthaRelease = {
      impactingCommits: [],
      releaseType: { type: 'prerelease', tag: 'alpha' },
      workspace: {
        path: '/packages/package-c',
        pkg: {
          raw: '',
          name: 'package-c',
          version: '1.0.0',
          dependencies: [],
        },
      },
    }

    const prepatchRelease: SemanthaRelease = {
      impactingCommits: [],
      releaseType: { type: 'prepatch', tag: 'alpha' },
      workspace: {
        path: '/packages/package-c',
        pkg: {
          raw: '',
          name: 'package-c',
          version: '1.0.0',
          dependencies: [],
        },
      },
    }

    const patchRelease: SemanthaRelease = {
      impactingCommits: [],
      releaseType: { type: 'patch' },
      workspace: {
        path: '/packages/package-c',
        pkg: {
          raw: '',
          name: 'package-c',
          version: '1.0.0',
          dependencies: [],
        },
      },
    }

    const preminorRelease: SemanthaRelease = {
      impactingCommits: [],
      releaseType: { type: 'preminor', tag: 'alpha' },
      workspace: {
        path: '/packages/package-c',
        pkg: {
          raw: '',
          name: 'package-c',
          version: '1.0.0',
          dependencies: [],
        },
      },
    }

    const minorRelease: SemanthaRelease = {
      impactingCommits: [],
      releaseType: { type: 'minor' },
      workspace: {
        path: '/packages/package-c',
        pkg: {
          raw: '',
          name: 'package-c',
          version: '1.0.0',
          dependencies: [],
        },
      },
    }

    const premajorRelease: SemanthaRelease = {
      impactingCommits: [],
      releaseType: { type: 'premajor', tag: 'alpha' },
      workspace: {
        path: '/packages/package-c',
        pkg: {
          raw: '',
          name: 'package-c',
          version: '1.0.0',
          dependencies: [],
        },
      },
    }

    const majorRelease: SemanthaRelease = {
      impactingCommits: [],
      releaseType: { type: 'major' },
      workspace: {
        path: '/packages/package-c',
        pkg: {
          raw: '',
          name: 'package-c',
          version: '1.0.0',
          dependencies: [],
        },
      },
    }
    /* Tests */
    expect(getNextVersion(noRelease)).toMatch('1.0.0')
    expect(getNextVersion(preRelease)).toMatch('1.0.1-alpha.0')
    expect(getNextVersion(prepatchRelease)).toMatch('1.0.1-alpha')
    expect(getNextVersion(patchRelease)).toMatch('1.0.1')
    expect(getNextVersion(preminorRelease)).toMatch('1.1.0-alpha')
    expect(getNextVersion(minorRelease)).toMatch('1.1.0')
    expect(getNextVersion(premajorRelease)).toMatch('2.0.0-alpha')
    expect(getNextVersion(majorRelease)).toMatch('2.0.0')
  })
})
