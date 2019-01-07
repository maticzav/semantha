import execa from 'execa'

/* Adapted from semantic-release/semantic-release */

/**
 * Verify if the `ref` is in the direct history of the current branch.
 *
 * @param {String} ref The reference to look for.
 * @param {Object} [execaOpts] Options to pass to `execa`.
 *
 * @return {Boolean} `true` if the reference is in the history of the current branch, falsy otherwise.
 */
export async function isRefInHistory(
  ref: string,
  options: execa.Options,
): Promise<
  { status: 'ok'; isRefInHistory: boolean } | { status: 'err'; message: string }
> {
  try {
    await execa.sync('git', ['merge-base', '--is-ancestor', ref, 'HEAD'])
    return { status: 'ok', isRefInHistory: true }
  } catch (error) {
    if (error.code === 1) {
      return { status: 'ok', isRefInHistory: false }
    } else {
      return { status: 'err', message: error.message }
    }
  }
}

/**
 *
 * Obtains remote head.
 *
 * @param branch
 */
export async function getRemoteHead(
  branch: string,
  options: execa.Options,
): Promise<
  { status: 'ok'; head: string } | { status: 'err'; message: string }
> {
  try {
    const head = await execa
      .stdout('git', ['ls-remote', '--heads', 'origin', branch], {})
      .then(res => res.match(/^(\w+)?/)![1])

    return { status: 'ok', head: head }
  } catch (err) {
    return { status: 'err', message: err.message }
  }
}

/**
 * Verify the local branch is up to date with the remote one.
 *
 * @param {String} branch The repository branch for which to verify status.
 * @param {Object} [execaOpts] Options to pass to `execa`.
 *
 * @return {Boolean} `true` is the HEAD of the current local branch is the same as the HEAD of the remote branch, falsy otherwise.
 */
export async function isBranchUpToDate(
  branch: string,
  options: execa.Options,
): Promise<
  { status: 'ok'; updated: boolean } | { status: 'err'; message: string }
> {
  try {
    const remoteHead = await getRemoteHead(branch, options)

    if (remoteHead.status !== 'ok') {
      return { status: 'err', message: remoteHead.message }
    }

    const refInHistory = await isRefInHistory(remoteHead.head, options)

    if (refInHistory.status !== 'ok') {
      return { status: 'err', message: refInHistory.message }
    }

    return { status: 'ok', updated: refInHistory.isRefInHistory }
  } catch (error) {
    return { status: 'err', message: error.message }
  }
}
