import {
  Workspace,
  GithubCommit,
  SemanthaRule,
  analyzeCommits,
  releaseTypes,
} from '..'
import { SemanthaRelease } from '../analyser'

describe('analyser', () => {
  test('analyser works as expected', async () => {
    /* Mocks */
    const workspaces: { [workspace: string]: Workspace } = {
      'package-a': {
        path: '/packages/package-a',
        pkg: {
          name: 'package-a',
          version: '1.0.0',
          dependencies: [
            {
              name: 'package-b',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'package-c',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'irrelavant',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'irrelavantDev',
              type: 'devDependencies',
              version: '1.0.0',
            },
          ],
        },
      },
      'package-b': {
        path: '/packages/package-b',
        pkg: {
          name: 'package-b',
          version: '1.0.0',
          dependencies: [
            {
              name: 'package-e',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'irrelavant',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'irrelavantDev',
              type: 'devDependencies',
              version: '1.0.0',
            },
          ],
        },
      },
      'package-c': {
        path: '/packages/package-c',
        pkg: {
          name: 'package-c',
          version: '1.0.0',
          dependencies: [
            {
              name: 'package-d',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'irrelavant',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'irrelavantDev',
              type: 'devDependencies',
              version: '1.0.0',
            },
          ],
        },
      },
      'package-d': {
        path: '/packages/package-d',
        pkg: {
          name: 'package-d',
          version: '1.0.0',
          dependencies: [
            {
              name: 'irrelavant',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'irrelavantDev',
              type: 'devDependencies',
              version: '1.0.0',
            },
          ],
        },
      },
      'package-e': {
        path: '/packages/package-e',
        pkg: {
          name: 'package-e',
          version: '1.0.0',
          dependencies: [
            {
              name: 'package-f',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'irrelavant',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'irrelavantDev',
              type: 'devDependencies',
              version: '1.0.0',
            },
          ],
        },
      },
      'package-f': {
        path: '/packages/package-f',
        pkg: {
          name: 'package-f',
          version: '1.0.0',
          dependencies: [
            {
              name: 'package-d',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'package-g',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'irrelavant',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'irrelavantDev',
              type: 'devDependencies',
              version: '1.0.0',
            },
          ],
        },
      },
      'package-g': {
        path: '/packages/package-g',
        pkg: {
          name: 'package-g',
          version: '1.0.0',
          dependencies: [
            {
              name: 'package-b',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'package-d',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'irrelavant',
              type: 'dependencies',
              version: '1.0.0',
            },
            {
              name: 'irrelavantDev',
              type: 'devDependencies',
              version: '1.0.0',
            },
          ],
        },
      },
    }

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
      { regex: new RegExp('fix:'), releaseType: releaseTypes.FIX },
      { regex: new RegExp('feat:'), releaseType: releaseTypes.MINOR },
      { regex: new RegExp('perf:'), releaseType: releaseTypes.MAJOR },
    ]

    const analysis = analyzeCommits(Object.values(workspaces), commits, rules)

    expect(analysis).toEqual([
      {
        impactingCommits: [
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
        releaseType: 3,
        workspace: workspaces['package-a'],
      },
      {
        impactingCommits: [],
        releaseType: 1,
        workspace: workspaces['package-b'],
      },
      {
        impactingCommits: [
          {
            body: '',
            files: [{ filename: '/packages/package-c/package.json' }],
            message: 'feat: Minor change package-c',
            sha: '',
          },
        ],
        releaseType: 2,
        workspace: workspaces['package-c'],
      },
      {
        impactingCommits: [],
        releaseType: 0,
        workspace: workspaces['package-d'],
      },
      {
        impactingCommits: [
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
        releaseType: 1,
        workspace: workspaces['package-e'],
      },
      {
        impactingCommits: [],
        releaseType: 1,
        workspace: workspaces['package-f'],
      },
      {
        impactingCommits: [],
        releaseType: 1,
        workspace: workspaces['package-g'],
      },
    ] as SemanthaRelease[])
  })
})
