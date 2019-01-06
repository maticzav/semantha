import { SemanthaRelease } from '../analyser'
import { generateChangelog } from '../changelog'

describe('changelog', () => {
  test('generateChangelog generates changelog as expected', async () => {
    const release: SemanthaRelease = {
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
          name: 'package-c',
          version: '1.0.0',
          dependencies: { irrelavant: '1.0.0', 'package-d': '1.0.0' },
          devDependencies: { irrelavantDev: '1.0.0' },
        },
      },
    }

    expect(generateChangelog(release)).toMatchSnapshot()
  })
})
