import meow from 'meow'
import { manage } from './manager'

const cli = meow(
  `
Usage
  $ semantha
Options
  --dryrun Perform a dryrun with no changes
`,
  {
    flags: {
      dryRun: {
        type: 'boolean',
        default: false,
      },
    },
  },
)

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') main(cli)

export async function main(cli: meow.Result): Promise<void> {
  manage(process.cwd(), { dryRun: cli.flags.dryRun }).then(res => {
    if (res.status === 'ok') {
      console.log(res.report)
      process.exit(0)
    } else {
      console.warn(res.message)
      process.exit(1)
    }
  })
}
