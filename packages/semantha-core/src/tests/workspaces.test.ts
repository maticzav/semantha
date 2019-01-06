import * as path from 'path'
import { loadWorkspace } from '..'

describe('workspaces functions work correctly', () => {
  test('errors on missing workspace definition', async () => {
    const workspacePath = path.resolve(__dirname, './__fixtures__/random/')
    const workspace = loadWorkspace(workspacePath)

    expect(workspace).toEqual({
      status: 'err',
      message: '',
    })
  })

  test('correctly finds workspace definition', async () => {
    const workspacePath = path.resolve(__dirname, './__fixtures__/workspace/')
    const workspace = loadWorkspace(workspacePath)

    expect(workspace).toEqual({
      status: 'ok',
      workspace: {},
    })
  })
})
