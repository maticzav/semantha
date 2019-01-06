import {
  Workspace,
  GithubCommit,
  SemanthaRule,
  analyzeCommits,
  constants,
} from '..'

describe('analyser', () => {
  test('analyser works as expected', async () => {
    /* Mocks */
    const workspaces: Workspace[] = [
      {
        path: '/packages/package-a',
        pkg: {
          name: 'package-a',
          version: '1.0.0',
          dependencies: {
            'package-b': '1.0.0',
            'package-c': '1.0.0',
            irrelavant: '1.0.0',
          },
          devDependencies: {
            irrelavantDev: '1.0.0',
          },
        },
      },
      {
        path: '/packages/package-b',
        pkg: {
          name: 'package-b',
          version: '1.0.0',
          dependencies: {
            irrelavant: '1.0.0',
            'package-e': '1.0.0',
          },
          devDependencies: {
            irrelavantDev: '1.0.0',
          },
        },
      },
      {
        path: '/packages/package-c',
        pkg: {
          name: 'package-c',
          version: '1.0.0',
          dependencies: {
            'package-d': '1.0.0',
            irrelavant: '1.0.0',
          },
          devDependencies: {
            irrelavantDev: '1.0.0',
          },
        },
      },
      {
        path: '/packages/package-d',
        pkg: {
          name: 'package-d',
          version: '1.0.0',
          dependencies: {
            irrelavant: '1.0.0',
          },
          devDependencies: {
            irrelavantDev: '1.0.0',
          },
        },
      },
      {
        path: '/packages/package-e',
        pkg: {
          name: 'package-e',
          version: '1.0.0',
          dependencies: {
            irrelavant: '1.0.0',
            'package-f': '1.0.0',
          },
          devDependencies: {
            irrelavantDev: '1.0.0',
          },
        },
      },
      {
        path: '/packages/package-f',
        pkg: {
          name: 'package-f',
          version: '1.0.0',
          dependencies: {
            irrelavant: '1.0.0',
            'package-d': '1.0.0',
            'package-g': '1.0.0',
          },
          devDependencies: {
            irrelavantDev: '1.0.0',
          },
        },
      },
      {
        path: '/packages/package-g',
        pkg: {
          name: 'package-g',
          version: '1.0.0',
          dependencies: {
            irrelavant: '1.0.0',
            'package-b': '1.0.0',
            'package-d': '1.0.0',
          },
          devDependencies: {
            irrelavantDev: '1.0.0',
          },
        },
      },
    ]

    const commits: GithubCommit[] = [
      {
        sha: '',
        message: 'fix: Fixes package-a and package-e issue',
        body: '',
        files: [
          {
            filename: '/packages/package-a/utils.ts',
          },
          {
            filename: '/packages/package-a/package.json',
          },
          {
            filename: '/packages/package-e/utils.ts',
          },
        ],
      },
      {
        sha: '',
        message: 'feat: Minor change package-c',
        body: '',
        files: [
          {
            filename: '/packages/package-c/package.json',
          },
        ],
      },
      {
        sha: '',
        message: 'perf: Breaking change package-a',
        body: '',
        files: [
          {
            filename: '/packages/package-a/index.ts',
          },
        ],
      },
      {
        sha: '',
        message: 'ignored',
        body: '',
        files: [
          {
            filename: '/packages/package-a/index.ts',
          },
        ],
      },
    ]

    const rules: SemanthaRule[] = [
      { regex: new RegExp('fix:'), release: constants.FIX },
      { regex: new RegExp('feat:'), release: constants.MINOR },
      { regex: new RegExp('perf:'), release: constants.MAJOR },
    ]

    const analysis = analyzeCommits(workspaces, commits, rules)

    expect(analysis).toEqual([
      {
        commits: [
          {
            body: '',
            files: [
              { filename: '/packages/package-a/utils.ts' },
              { filename: '/packages/package-a/package.json' },
              { filename: '/packages/package-e/utils.ts' },
            ],
            message: 'fix: Fixes package-a and package-e issue',
            sha: '',
          },
          {
            body: '',
            files: [{ filename: '/packages/package-a/index.ts' }],
            message: 'perf: Breaking change package-a',
            sha: '',
          },
          {
            body: '',
            files: [{ filename: '/packages/package-a/index.ts' }],
            message: 'ignored',
            sha: '',
          },
        ],
        version: 3,
        workspace: {
          path: '/packages/package-a',
          pkg: {
            dependencies: {
              irrelavant: '1.0.0',
              'package-b': '1.0.0',
              'package-c': '1.0.0',
            },
            devDependencies: { irrelavantDev: '1.0.0' },
            name: 'package-a',

            version: '1.0.0',
          },
        },
      },
      {
        commits: [],
        version: 1,
        workspace: {
          path: '/packages/package-b',
          pkg: {
            dependencies: { irrelavant: '1.0.0', 'package-e': '1.0.0' },
            devDependencies: { irrelavantDev: '1.0.0' },
            name: 'package-b',

            version: '1.0.0',
          },
        },
      },
      {
        commits: [
          {
            body: '',
            files: [{ filename: '/packages/package-c/package.json' }],
            message: 'feat: Minor change package-c',
            sha: '',
          },
        ],
        version: 2,
        workspace: {
          path: '/packages/package-c',
          pkg: {
            dependencies: { irrelavant: '1.0.0', 'package-d': '1.0.0' },
            devDependencies: { irrelavantDev: '1.0.0' },
            name: 'package-c',

            version: '1.0.0',
          },
        },
      },
      {
        commits: [],
        version: 0,
        workspace: {
          path: '/packages/package-d',
          pkg: {
            dependencies: { irrelavant: '1.0.0' },
            devDependencies: { irrelavantDev: '1.0.0' },
            name: 'package-d',

            version: '1.0.0',
          },
        },
      },
      {
        commits: [
          {
            body: '',
            files: [
              { filename: '/packages/package-a/utils.ts' },
              { filename: '/packages/package-a/package.json' },
              { filename: '/packages/package-e/utils.ts' },
            ],
            message: 'fix: Fixes package-a and package-e issue',
            sha: '',
          },
        ],
        version: 1,
        workspace: {
          path: '/packages/package-e',
          pkg: {
            name: 'package-e',
            version: '1.0.0',
            dependencies: { irrelavant: '1.0.0', 'package-f': '1.0.0' },
            devDependencies: { irrelavantDev: '1.0.0' },
          },
        },
      },
      {
        commits: [],
        version: 1,
        workspace: {
          path: '/packages/package-f',
          pkg: {
            name: 'package-f',
            version: '1.0.0',
            dependencies: {
              irrelavant: '1.0.0',
              'package-d': '1.0.0',
              'package-g': '1.0.0',
            },
            devDependencies: { irrelavantDev: '1.0.0' },
          },
        },
      },
      {
        commits: [],
        version: 1,
        workspace: {
          path: '/packages/package-g',
          pkg: {
            name: 'package-g',
            version: '1.0.0',
            dependencies: {
              irrelavant: '1.0.0',
              'package-b': '1.0.0',
              'package-d': '1.0.0',
            },
            devDependencies: { irrelavantDev: '1.0.0' },
          },
        },
      },
    ])
  })
})
