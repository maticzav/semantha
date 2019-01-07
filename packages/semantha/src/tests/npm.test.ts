import * as execa from 'execa'
import { publish } from '../'

describe('npm', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  test('publish publishes workspace correctly', async () => {
    /* Mock */

    const execaMock = jest.spyOn(execa, 'default').mockResolvedValue(undefined)

    /* Execution */

    const res = await publish({
      commits: [],
      version: 1,
      workspace: {
        path: '/packages/package-c',
        pkg: {
          name: 'package-c',
          version: '1.0.0',
          dependencies: {},
          devDependencies: {},
        },
      },
    })

    /* Tests */

    expect(res).toEqual({
      status: 'ok',
      release: {
        commits: [],
        version: 1,
        workspace: {
          path: '/packages/package-c',
          pkg: {
            name: 'package-c',
            version: '1.0.0',
            dependencies: {},
            devDependencies: {},
          },
        },
      },
    })
    expect(execaMock).toBeCalledWith('npm', ['publish'], {
      cwd: '/packages/package-c',
    })
  })

  test('publish reports error correctly', async () => {
    /* Mock */

    const execaMock = jest.spyOn(execa, 'default').mockImplementation(() => {
      throw new Error('pass')
    })

    /* Execution */

    const res = await publish({
      commits: [],
      version: 1,
      workspace: {
        path: '/packages/package-c',
        pkg: {
          name: 'package-c',
          version: '1.0.0',
          dependencies: {},
          devDependencies: {},
        },
      },
    })

    /* Tests */

    expect(res).toEqual({
      status: 'err',
      message: 'pass',
    })
    expect(execaMock).toBeCalledWith('npm', ['publish'], {
      cwd: '/packages/package-c',
    })
  })
})
