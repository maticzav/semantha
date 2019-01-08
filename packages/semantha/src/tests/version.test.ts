import * as fs from 'fs-extra'
import * as path from 'path'
import { SemanthaRelease } from 'semantha-core'
import tempy from 'tempy'

import { prepareWorkspace } from '../'

import * as writePkg from 'write-pkg'

describe('version', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  test('prepareWorkspace correctly reports error', async () => {
    /* Mock */

    const writePkgMock = jest.spyOn(writePkg, 'sync').mockImplementation(() => {
      throw new Error('pass')
    })

    /* Execution */

    const res = await prepareWorkspace(
      {
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
      [],
    )

    /* Tests */

    expect(res).toEqual({
      status: 'err',
      message: 'pass',
    })
    expect(writePkgMock).toBeCalledWith({
      version: '1.0.1',
      dependencies: {},
      devDependencies: {},
    })
  })

  test('prepareWorkspace versions workspace correctly', async () => {
    /* Setup */

    const tmp = tempy.directory()

    const w = path.resolve(__dirname, './__fixtures__/workspaces/valid/')
    fs.copy(w, tmp)

    const releases: SemanthaRelease[] = [
      {
        commits: [],
        version: 3,
        workspace: {
          path: path.resolve(tmp, './packages/package-a/'),
          pkg: {
            name: 'package-a',
            version: '1.0.0',
            dependencies: {
              something: '1.0.0',
              'package-b': '1.0.2',
            },
            devDependencies: {
              devit: '1.0.0',
              'package-c': '2.0.0',
            },
          },
        },
      },
      {
        commits: [],
        version: 2,
        workspace: {
          path: path.resolve(tmp, './packages/package-b/'),
          pkg: {
            name: 'package-b',
            version: '1.0.2',
            dependencies: {
              something: '1.0.0',
              'package-c': '2.0.0',
            },
            devDependencies: {
              devit: '1.0.0',
            },
          },
        },
      },
      {
        commits: [],
        version: 1,
        workspace: {
          path: path.resolve(tmp, './packages/package-c/'),
          pkg: {
            name: 'package-c',
            version: '2.0.0',
            dependencies: {
              something: '1.0.0',
            },
            devDependencies: {
              devit: '1.0.0',
            },
          },
        },
      },
    ]

    /* Execution */

    const res = await prepareWorkspace(releases[0], releases)

    const pkg = JSON.parse(
      fs.readFileSync(`${releases[0].workspace.path}/package.json`, 'utf-8'),
    )

    /* Tests */

    expect(res).toEqual({
      status: 'ok',
      release: releases[0],
    })
    expect(pkg).toEqual({
      name: 'package-a',
      version: '2.0.0',
      dependencies: {
        something: '1.0.0',
        'package-b': '1.1.0',
      },
      devDependencies: {
        devit: '1.0.0',
        'package-c': '2.0.1',
      },
    })
  })
})
