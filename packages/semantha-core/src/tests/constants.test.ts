import { constants } from '..'

describe('constants', () => {
  test('match expected values', async () => {
    expect(constants).toEqual({
      IGNORE: 0,
      FIX: 1,
      MINOR: 2,
      MAJOR: 3,
    })
  })
})
