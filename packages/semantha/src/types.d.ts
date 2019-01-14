declare module 'libnpmpublish' {
  import { ReadStream } from 'fs'

  interface Options {
    npmVersion?: string
    token?: string
  }

  export function publish(
    pkg: object,
    tar: ReadStream,
    options?: Options,
  ): Promise<void>
  export function unpublish(spec: string, options?: Options): Promise<void>
}
