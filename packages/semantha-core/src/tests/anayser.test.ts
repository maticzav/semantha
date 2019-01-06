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
          _id: 'package-a@',
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
          readme: 'ERROR: No README data found!',
        },
      },
      {
        path: '/packages/package-b',
        pkg: {
          _id: 'package-b@',
          name: 'package-b',
          version: '1.0.0',
          dependencies: {
            irrelavant: '1.0.0',
            'package-e': '1.0.0',
          },
          devDependencies: {
            irrelavantDev: '1.0.0',
          },
          readme: 'ERROR: No README data found!',
        },
      },
      {
        path: '/packages/package-c',
        pkg: {
          _id: 'package-c@',
          name: 'package-c',
          version: '1.0.0',
          dependencies: {
            'package-d': '1.0.0',
            irrelavant: '1.0.0',
          },
          devDependencies: {
            irrelavantDev: '1.0.0',
          },
          readme: 'ERROR: No README data found!',
        },
      },
      {
        path: '/packages/package-d',
        pkg: {
          _id: 'package-d@',
          name: 'package-d',
          version: '1.0.0',
          dependencies: {
            irrelavant: '1.0.0',
          },
          devDependencies: {
            irrelavantDev: '1.0.0',
          },
          readme: 'ERROR: No README data found!',
        },
      },
      {
        path: '/packages/package-e',
        pkg: {
          _id: 'package-e@',
          name: 'package-e',
          version: '1.0.0',
          dependencies: {
            irrelavant: '1.0.0',
            'package-f': '1.0.0',
          },
          devDependencies: {
            irrelavantDev: '1.0.0',
          },
          readme: 'ERROR: No README data found!',
        },
      },
      {
        path: '/packages/package-f',
        pkg: {
          _id: 'package-f@',
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
          readme: 'ERROR: No README data found!',
        },
      },
      {
        path: '/packages/package-g',
        pkg: {
          _id: 'package-g@',
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
          readme: 'ERROR: No README data found!',
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
            _id: 'package-a@',
            dependencies: {
              irrelavant: '1.0.0',
              'package-b': '1.0.0',
              'package-c': '1.0.0',
            },
            devDependencies: { irrelavantDev: '1.0.0' },
            name: 'package-a',
            readme: 'ERROR: No README data found!',
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
            _id: 'package-b@',
            dependencies: { irrelavant: '1.0.0', 'package-e': '1.0.0' },
            devDependencies: { irrelavantDev: '1.0.0' },
            name: 'package-b',
            readme: 'ERROR: No README data found!',
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
            _id: 'package-c@',
            dependencies: { irrelavant: '1.0.0', 'package-d': '1.0.0' },
            devDependencies: { irrelavantDev: '1.0.0' },
            name: 'package-c',
            readme: 'ERROR: No README data found!',
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
            _id: 'package-d@',
            dependencies: { irrelavant: '1.0.0' },
            devDependencies: { irrelavantDev: '1.0.0' },
            name: 'package-d',
            readme: 'ERROR: No README data found!',
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
            _id: 'package-e@',
            dependencies: { irrelavant: '1.0.0', 'package-f': '1.0.0' },
            devDependencies: { irrelavantDev: '1.0.0' },
            name: 'package-e',
            readme: 'ERROR: No README data found!',
            version: '1.0.0',
          },
        },
      },
      {
        commits: [],
        version: 1,
        workspace: {
          path: '/packages/package-f',
          pkg: {
            _id: 'package-f@',
            dependencies: {
              irrelavant: '1.0.0',
              'package-d': '1.0.0',
              'package-g': '1.0.0',
            },
            devDependencies: { irrelavantDev: '1.0.0' },
            name: 'package-f',
            readme: 'ERROR: No README data found!',
            version: '1.0.0',
          },
        },
      },
      {
        commits: [],
        version: 1,
        workspace: {
          path: '/packages/package-g',
          pkg: {
            _id: 'package-g@',
            dependencies: {
              irrelavant: '1.0.0',
              'package-b': '1.0.0',
              'package-d': '1.0.0',
            },
            devDependencies: { irrelavantDev: '1.0.0' },
            name: 'package-g',
            readme: 'ERROR: No README data found!',
            version: '1.0.0',
          },
        },
      },
    ])
  })
})
