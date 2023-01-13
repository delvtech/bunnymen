import { Initializer } from './initializer'
import { Loader } from './loader'

// placeholder
class Cache<TData extends any = any> {
  get(): TData {
    return 'data' as TData
  }
}

export type Frequency = number | 'static'

export interface IDatasetOptions {
  initializer?: Initializer
  cid?: string
  /**
   * Number of blocks until the data is considered stale. Set to `"static"` to
   * prevent the data from ever going stale.
   */
  frequency?: Frequency
}

export class Dataset<TData extends any = any> {
  node: Node
  initializer?: Initializer
  fetcher: Fetcher
  loader: Loader
  cid?: string
  cache: Cache<TData>
  // 'static' = never stale
  frequency: Frequency

  constructor(
    node: Node,
    fetcher: Fetcher,
    loader: Loader,
    options?: IDatasetOptions
  ) {
    const { initializer, cid, frequency = 'static' } = options || {}
    this.node = node
    this.initializer = initializer
    this.fetcher = fetcher
    this.loader = loader
    this.cid === cid
    this.cache = new Cache()
    this.frequency = frequency
  }

  get(): TData {
    return this.cache.get()
  }

  isStale(): boolean {
    return false
  }
}
