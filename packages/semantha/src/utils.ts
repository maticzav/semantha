/**
 *
 * Returns default value on undefined.
 *
 * @param fallaback
 */
export function withDefault<T>(fallaback: T): (value: T | undefined) => T {
  return value => {
    if (value === undefined) return fallaback
    else return value
  }
}

/**
 *
 * Maps and filters values.
 *
 * @param fn
 * @param xs
 */
export function filterMap<T, Y>(
  fn: (x: T) => Y | null | undefined,
  xs: T[],
): Y[] {
  return xs.map(fn).filter(hasValue)

  /* Helper functions */
  function hasValue<T>(x: T | null | undefined): x is T {
    return x !== null && x !== undefined
  }
}

/**
 *
 * Merges multiple errors into one.
 *
 * @param xs
 */
export function mergeErrors<T>(
  xs: ({ status: 'ok' } & T | { status: 'err'; message: string })[],
): { status: 'err'; message: string } {
  const message = filterMap(x => {
    if (x.status === 'ok') {
      return null
    } else {
      return x.message
    }
  }, xs).join('\n')

  return { status: 'err', message: message }
}
