declare module 'read-pkg' {
  interface Options {
    cwd: string
    normalize: boolean
  }

  interface PackageJSON {
    name: string
    repository?: string
    workspaces?: string[]
  }

  export default function(options?: Options): Promise<PackageJSON>
  export function sync(options?: Options): PackageJSON
}
