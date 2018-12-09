declare module 'read-pkg' {
  interface Options {
    cwd?: string
    normalize?: boolean
  }

  /** Taken from @types/normalize-package-data */
  interface Input {
    [k: string]: any
  }

  interface Person {
    name?: string
    email?: string
    url?: string
  }

  interface Package {
    [k: string]: any
    name: string
    version: string
    files?: string[]
    bin?: { [k: string]: string }
    man?: string[]
    keywords?: string[]
    author?: Person
    maintainers?: Person[]
    contributors?: Person[]
    bundleDependencies?: { [name: string]: string }
    dependencies?: { [name: string]: string }
    devDependencies?: { [name: string]: string }
    optionalDependencies?: { [name: string]: string }
    description?: string
    engines?: { [type: string]: string }
    license?: string
    repository?: { type: string; url: string }
    bugs?: { url: string; email?: string } | { url?: string; email: string }
    homepage?: string
    scripts?: { [k: string]: string }
    readme: string
    _id: string
    /** Workspaces definition */
    workspaces?: string[]
  }

  export default function(options?: Options): Promise<Package>
  export function sync(options?: Options): Package
}
