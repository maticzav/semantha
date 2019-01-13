export type SemanthaVersion = number

export const releaseTypes: { [release: string]: SemanthaVersion } = {
  IGNORE: 0,
  FIX: 1,
  MINOR: 2,
  MAJOR: 3,
}

export const firstVersion = '0.0.0'

// var semver = require("semver")

// const alpha = semver.inc("1.0.0", "premajor", "alpha")

// const beta = semver.inc(alpha, "prerelease", "beta")

// const major = semver.inc(beta, "major")

// console.log(alpha, beta, major)

// const notation = semver.valid("0.0.0-semantha")

// console.log(notation)
