import { sync as execa } from 'execa'
import { SemanthaRelease } from 'semantha-core'

export interface PublishOptions {
  registry: string
}

/**
 *
 * Publishes release to NPM.
 *
 * @param release
 */
export function publish(
  release: SemanthaRelease,
  options: PublishOptions,
):
  | { status: 'ok'; release: SemanthaRelease }
  | { status: 'err'; message: string } {
  try {
    execa('npm', ['publish', '--registry', options.registry], {
      cwd: release.workspace.path,
      stdio: 'inherit',
    })

    return { status: 'ok', release: release }
  } catch (err) {
    return { status: 'err', message: err.message }
  }
}
