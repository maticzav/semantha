import * as path from 'path'
import { findAllWorkspacesForPaths } from '../workspaces'

describe('workspace functions work as expected', () => {
  test('findAllWorkspacesForPaths finds workspaces in path', async () => {
    const cwd = path.resolve(__dirname, './__fixtures__/workspaces/')
    const workspaces = await findAllWorkspacesForPaths(['packages/*'], cwd)

    /* Tests */

    expect(workspaces).toEqual({
      status: 'ok',
      workspaces: [
        {
          path:
            '/Users/maticzavadlal/Code/sandbox/semantha/packages/semantha/src/tests/__fixtures__/workspaces/packages/package-a',
          pkg: {
            _id: 'package-a@0.0.0',
            name: 'package-a',
            version: '0.0.0',
            dependencies: {},
            readme: 'ERROR: No README data found!',
          },
        },
        {
          path:
            '/Users/maticzavadlal/Code/sandbox/semantha/packages/semantha/src/tests/__fixtures__/workspaces/packages/package-b',
          pkg: {
            _id: 'package-b@0.0.0',
            name: 'package-b',
            version: '0.0.0',
            dependencies: {},
            readme: 'ERROR: No README data found!',
          },
        },
        {
          path:
            '/Users/maticzavadlal/Code/sandbox/semantha/packages/semantha/src/tests/__fixtures__/workspaces/packages/package-c',
          pkg: {
            _id: 'package-c@0.0.0',
            name: 'package-c',
            version: '0.0.0',
            dependencies: {},
            readme: 'ERROR: No README data found!',
          },
        },
      ],
    })
  })

  test('findAllWorkspacesForPaths throws on invalid workspace configuration', async () => {
    const cwd = path.resolve(__dirname, './__fixtures__/workspaces/')
    const workspaces = await findAllWorkspacesForPaths(['packages'], cwd)

    /* Tests */

    expect(workspaces).toEqual({
      status: 'err',
      message:
        "ENOENT: no such file or directory, open '/Users/maticzavadlal/Code/sandbox/semantha/packages/semantha/src/tests/__fixtures__/workspaces/packages/package.json'",
    })
  })
})
