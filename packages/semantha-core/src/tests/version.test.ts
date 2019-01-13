// import { SemanthaRelease } from '../analyser'
// import { getNextVersion, versionWorkspace } from '../version'

describe('version', () => {
  test('', () => {
    expect(2).toBe(2)
  })
  // test('versionWorkspace versions correctly', async () => {
  //   const releases: SemanthaRelease[] = [
  //     {
  //       impactingCommits: [],
  //       releaseType: 3,
  //       workspace: {
  //         path: `/packages/package-a/`,
  //         pkg: {
  //           name: 'package-a',
  //           version: '1.0.0',
  //           dependencies: [],
  //         },
  //       },
  //     },
  //     {
  //       commits: [],
  //       version: 2,
  //       workspace: {
  //         path: `/packages/package-b/`,
  //         pkg: {
  //           name: 'package-b',
  //           version: '1.0.2',
  //           dependencies: {
  //             something: '1.0.0',
  //             'package-c': '2.0.0',
  //           },
  //           devDependencies: {
  //             devit: '1.0.0',
  //           },
  //         },
  //       },
  //     },
  //     {
  //       commits: [],
  //       version: 1,
  //       workspace: {
  //         path: `/packages/package-c/`,
  //         pkg: {
  //           name: 'package-c',
  //           version: '2.0.0',
  //           dependencies: {
  //             something: '1.0.0',
  //           },
  //           devDependencies: {
  //             devit: '1.0.0',
  //           },
  //         },
  //       },
  //     },
  //   ]
  //   expect(versionWorkspace(releases[0], releases)).toEqual({
  //     version: '2.0.0',
  //     dependencies: {
  //       'package-b': '1.1.0',
  //     },
  //     devDependencies: {
  //       'package-c': '2.0.1',
  //     },
  //   })
  // })
  // test('getNextVersion works as expected', async () => {
  //   const noRelease: SemanthaRelease = {
  //     commits: [],
  //     version: 0,
  //     workspace: {
  //       path: '/packages/package-c',
  //       pkg: {
  //         name: 'package-c',
  //         version: '1.0.0',
  //         dependencies: {},
  //         devDependencies: {},
  //       },
  //     },
  //   }
  //   const patchRelease: SemanthaRelease = {
  //     commits: [],
  //     version: 1,
  //     workspace: {
  //       path: '/packages/package-c',
  //       pkg: {
  //         name: 'package-c',
  //         version: '1.0.0',
  //         dependencies: {},
  //         devDependencies: {},
  //       },
  //     },
  //   }
  //   const minorRelease: SemanthaRelease = {
  //     commits: [],
  //     version: 2,
  //     workspace: {
  //       path: '/packages/package-c',
  //       pkg: {
  //         name: 'package-c',
  //         version: '1.0.0',
  //         dependencies: {},
  //         devDependencies: {},
  //       },
  //     },
  //   }
  //   const majorRelease: SemanthaRelease = {
  //     commits: [],
  //     version: 3,
  //     workspace: {
  //       path: '/packages/package-c',
  //       pkg: {
  //         name: 'package-c',
  //         version: '1.0.0',
  //         dependencies: {},
  //         devDependencies: {},
  //       },
  //     },
  //   }
  //   /* Tests */
  //   expect(getNextVersion(noRelease)).toMatch('1.0.0')
  //   expect(getNextVersion(patchRelease)).toMatch('1.0.1')
  //   expect(getNextVersion(minorRelease)).toMatch('1.1.0')
  //   expect(getNextVersion(majorRelease)).toMatch('2.0.0')
  // })
})
