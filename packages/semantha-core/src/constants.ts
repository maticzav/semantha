export type SemanthaVersion = number

export const constants: { [release: string]: SemanthaVersion } = {
  IGNORE: 0,
  FIX: 1,
  MINOR: 2,
  MAJOR: 3,
}
