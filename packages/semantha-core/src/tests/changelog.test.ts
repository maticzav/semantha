import { SemanthaRelease } from '../analyser'
import { generateChangelog } from '../changelog'

describe('changelog', () => {
  test('generateChangelog generates changelog as expected', async () => {
    const release: SemanthaRelease = {
      impactingCommits: [
        {
          body: '',
          files: [{ filename: '/packages/package-c/package.json' }],
          message: 'feat: Minor change package-c',
          sha: '',
        },
      ],
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

    expect(generateChangelog(release)).toMatchSnapshot()
  })
})
