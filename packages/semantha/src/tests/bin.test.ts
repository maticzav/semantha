import * as manager from '../manager'
import { main } from '../bin'

describe('bin', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  test('calls correct functions on success', async () => {
    /**
     * Mocks
     */
    const manageMock = jest
      .spyOn(manager, 'manage')
      .mockResolvedValue({ status: 'ok', report: {} })

    /* Execution */

    await main({ flags: { config: 'test' } } as any)

    /* Tests */

    expect(manageMock).toBeCalledTimes(1)
  })

  test('calls correct functions on reject', async () => {
    /* Mocks */
    const manageMock = jest
      .spyOn(manager, 'manage')
      .mockResolvedValue({ status: 'err', message: '' })

    /* Execution */

    await main({ flags: { config: 'test' } } as any)

    /* Tests */

    expect(manageMock).toBeCalledTimes(1)
  })
})
