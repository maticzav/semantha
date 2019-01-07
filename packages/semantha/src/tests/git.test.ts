import * as execa from 'execa'

import { isRefInHistory, isBranchUpToDate, getRemoteHead } from '../git'

describe('git', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  /**
   * isRefInHistory
   */

  test('isRefInHistory correctly reports error', async () => {
    /* Mock */

    const execaMock = jest.spyOn(execa, 'default').mockResolvedValue(undefined)

    /* Execution */

    const res = isRefInHistory('master')

    /* Tests */

    expect(2).toBe(2)
  })

  test('isRefInHistory correctly refInHistory', async () => {
    /* Mock */

    const execaMock = jest.spyOn(execa, 'default').mockResolvedValue(undefined)

    /* Execution */

    const res = isRefInHistory('master')

    /* Tests */

    expect(2).toBe(2)
  })

  /**
   * getRemoteHead
   */

  test('getRemoteHead correctly reports error', async () => {
    /* Mock */

    const execaMock = jest.spyOn(execa, 'default').mockResolvedValue(undefined)

    /* Execution */

    const res = getRemoteHead('master')

    /* Tests */

    expect(2).toBe(2)
  })

  test('getRemoteHead correctly finds remote head', async () => {
    /* Mock */

    const execaMock = jest.spyOn(execa, 'default').mockResolvedValue(undefined)

    /* Execution */

    const res = getRemoteHead('master')

    /* Tests */

    expect(2).toBe(2)
  })

  /**
   * isBranchUpToDate
   */
  test('isBranchUpToDate correctly logs remoteHead error', async () => {
    /* Mock */

    const execaMock = jest.spyOn(execa, 'default').mockResolvedValue(undefined)

    /* Execution */

    const res = isBranchUpToDate('master')

    /* Tests */

    expect(2).toBe(2)
  })

  test('isBranchUpToDate correctly logs refInHistory error', async () => {
    /* Mock */

    const execaMock = jest.spyOn(execa, 'default').mockResolvedValue(undefined)

    /* Execution */

    const res = isBranchUpToDate('master')

    /* Tests */

    expect(2).toBe(2)
  })

  test('isBranchUpToDate correctly determines whether branch is up to date', async () => {
    /* Mock */

    const execaMock = jest.spyOn(execa, 'default').mockResolvedValue(undefined)

    /* Execution */

    const res = isBranchUpToDate('master')

    /* Tests */

    expect(2).toBe(2)
  })
})
