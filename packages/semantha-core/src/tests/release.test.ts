import { SemanthaRelease } from '../analyser'
import { getNextVersion } from '../release'

describe('release', () => {
  test('getNextVersion works as expected', async () => {
    const noRelease: SemanthaRelease = {
      commits: [],
      version: 0,
      workspace: {
        path: '/packages/package-c',
        pkg: {
          _id: 'package-c@',
          name: 'package-c',
          readme: 'ERROR: No README data found!',
          version: '1.0.0',
        },
      },
    }

    const patchRelease: SemanthaRelease = {
      commits: [],
      version: 1,
      workspace: {
        path: '/packages/package-c',
        pkg: {
          _id: 'package-c@',
          name: 'package-c',
          readme: 'ERROR: No README data found!',
          version: '1.0.0',
        },
      },
    }

    const minorRelease: SemanthaRelease = {
      commits: [],
      version: 2,
      workspace: {
        path: '/packages/package-c',
        pkg: {
          _id: 'package-c@',
          name: 'package-c',
          readme: 'ERROR: No README data found!',
          version: '1.0.0',
        },
      },
    }

    const majorRelease: SemanthaRelease = {
      commits: [],
      version: 3,
      workspace: {
        path: '/packages/package-c',
        pkg: {
          _id: 'package-c@',
          name: 'package-c',
          readme: 'ERROR: No README data found!',
          version: '1.0.0',
        },
      },
    }

    /* Tests */

    expect(getNextVersion(noRelease)).toMatch('1.0.0')
    expect(getNextVersion(patchRelease)).toMatch('1.0.1')
    expect(getNextVersion(minorRelease)).toMatch('1.1.0')
    expect(getNextVersion(majorRelease)).toMatch('2.0.0')
  })
})
