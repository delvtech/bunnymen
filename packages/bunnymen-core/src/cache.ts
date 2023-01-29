// placeholder
// TODO: choose a caching method
export class Cache<TData extends any = any> {
  data: TData | undefined

  get(): TData | undefined {
    return this.data
  }
  set(data: TData): boolean {
    this.data = data
    return true
  }
}
