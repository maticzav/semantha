declare module 'libnpmpublish' {
  interface Options {
    npmVersion?: string
    token?: string
  }

  export function publish(
    pkg: object,
    tar: Buffer,
    options?: Options,
  ): Promise<void>
  export function unpublish(spec: string, options?: Options): Promise<void>
}
