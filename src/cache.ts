// placeholder
// TODO: choose a caching method
export class Cache<TData extends any = any> {
  data: TData | undefined

  get(): TData {
    return this.data as TData
  }
  set(data: TData): boolean {
    this.data = data
    return true
  }
}
