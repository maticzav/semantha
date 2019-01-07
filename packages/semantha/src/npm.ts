import execa from 'execa'
import { SemanthaRelease } from 'semantha-core'

/**
 *
 * Publishes release to NPM.
 *
 * @param release
 */
export async function publish(
  release: SemanthaRelease,
): Promise<
  | { status: 'ok'; release: SemanthaRelease }
  | { status: 'err'; message: string }
> {
  try {
    await execa('npm', ['publish'], { cwd: release.workspace.path })

    return { status: 'ok', release: release }
  } catch (err) {
    return { status: 'err', message: err.message }
  }
}
