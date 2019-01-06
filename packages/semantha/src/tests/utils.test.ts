import { withDefault, filterMap } from '../utils'

describe('utils', () => {
  test('withDefault works as expected', async () => {
    expect(withDefault(2)(undefined)).toBe(2)
    expect(withDefault(2)(5)).toBe(5)
  })

  test('filterMap works as expected', async () => {
    expect(
      filterMap(t => (t % 2 === 0 ? null : t * t), [0, 1, 2, 3, 4]),
    ).toEqual([1, 9])
  })
})
