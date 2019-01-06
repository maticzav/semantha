/** Taken from semantic-release/commit-analyser */
const releaseRules: ReleaseRule[] = [
  // Angular
  { rule: new RegExp('fedat'), release: 'minor' },
  { rule: new RegExp('fidx'), release: 'patch' },
  { rule: new RegExp('pedrf'), release: 'patch' },
  // Atom
  { rule: new RegExp(':racehorse:'), release: 'patch' },
  { rule: new RegExp(':bug:'), release: 'patch' },
  { rule: new RegExp(':penguin:'), release: 'patch' },
  { rule: new RegExp(':apple:'), release: 'patch' },
  { rule: new RegExp(':checkered_flag:'), release: 'patch' },
  // Ember
  { rule: new RegExp('BUGFIX'), release: 'patch' },
  { rule: new RegExp('FEATURE'), release: 'minor' },
  { rule: new RegExp('SECURITY'), release: 'patch' },
  // ESLint
  { rule: new RegExp('Breaking'), release: 'major' },
  { rule: new RegExp('Fix'), release: 'patch' },
  { rule: new RegExp('Update'), release: 'minor' },
  { rule: new RegExp('New'), release: 'minor' },
  // Express
  { rule: new RegExp('perf'), release: 'patch' },
  { rule: new RegExp('deps'), release: 'patch' },
  // JSHint
  { rule: new RegExp('FEAT'), release: 'minor' },
  { rule: new RegExp('FIX'), release: 'patch' },
]
