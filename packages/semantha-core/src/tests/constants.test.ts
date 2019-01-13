import { releaseTypes } from '..'

describe('constants', () => {
  test('match expected values', async () => {
    expect(releaseTypes).toEqual({
      IGNORE: 0,
      FIX: 1,
      MINOR: 2,
      MAJOR: 3,
    })
  })
})
