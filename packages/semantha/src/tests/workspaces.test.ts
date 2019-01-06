import * as path from 'path'
import { loadWorkspace } from 'semantha-core/src'

describe('workspaces functions work correctly', () => {
  test('errors on missing workspace definition', async () => {
    const workspacePath = path.resolve(__dirname, './__fixtures__/random/')
    const workspace = loadWorkspace(workspacePath)

    expect(workspace).toEqual({
      status: 'err',
      message: `ENOENT: no such file or directory, open '${workspacePath}/package.json'`,
    })
  })

  test('correctly finds workspace definition', async () => {
    const workspacePath = path.resolve(__dirname, './__fixtures__/workspace/')
    const workspace = loadWorkspace(workspacePath)

    expect(workspace).toEqual({
      status: 'ok',
      workspace: {
        path:
          '/Users/maticzavadlal/Code/sandbox/semantha/packages/semantha-core/src/tests/__fixtures__/workspace',
        pkg: {
          _id: 'test-workspace@',
          dependencies: {
            something: '1.0.0',
          },
          devDependencies: {
            devit: '1.0.0',
          },
          name: 'test-workspace',
          readme: 'ERROR: No README data found!',
          version: '',
        },
      },
    })
  })
})
