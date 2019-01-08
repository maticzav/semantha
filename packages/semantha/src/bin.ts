import meow from 'meow'
import { manage } from './manager'

const cli = meow(`
Usage
  $ semantha
Options
  No options. Just magic!
`)

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') main(cli)

export async function main(cli: meow.Result): Promise<void> {
  manage(process.cwd(), { dryRun: false }).then(res => {
    if (res.status === 'ok') {
      console.log(res.report)
    } else {
      console.warn(res.message)
    }
  })
}
