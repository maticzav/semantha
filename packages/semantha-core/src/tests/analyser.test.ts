import { Workspace, GithubCommit, SemanthaRule, analyzeCommits } from '..'
import { SemanthaRelease } from '../analyser'

describe('analyser', () => {
  test('analyser works as expected', async () => {
    /* Mocks */
    const workspaces: { [workspace: string]: Workspace } = {
      'package-a': {
        path: '/packages/package-a',
        pkg: {
          raw: '',
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
          raw: '',
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
          raw: '',
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
          raw: '',
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
          raw: '',
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
          raw: '',
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
          raw: '',
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
      { regex: new RegExp('fix:'), releaseType: { type: 'patch' } },
      { regex: new RegExp('feat:'), releaseType: { type: 'minor' } },
      { regex: new RegExp('perf:'), releaseType: { type: 'major' } },
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
        releaseType: { type: 'major' },
        workspace: workspaces['package-a'],
      },
      {
        impactingCommits: [],
        releaseType: { type: 'patch' },
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
        releaseType: { type: 'minor' },
        workspace: workspaces['package-c'],
      },
      {
        impactingCommits: [],
        releaseType: { type: 'ignore' },
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
        releaseType: { type: 'patch' },
        workspace: workspaces['package-e'],
      },
      {
        impactingCommits: [],
        releaseType: { type: 'patch' },
        workspace: workspaces['package-f'],
      },
      {
        impactingCommits: [],
        releaseType: { type: 'patch' },
        workspace: workspaces['package-g'],
      },
    ] as SemanthaRelease[])
  })
})
