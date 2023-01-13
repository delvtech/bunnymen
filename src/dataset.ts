import { ILoader } from './loader'
import { Node } from './node'
import { Cache } from './cache'

export type Fetcher<TData extends any = any> = () => TData | Promise<TData>

// 'static' = never stale
export type Frequency = number | 'static'

export interface IDatasetOptions {
  initializer?: Fetcher
  initialContentId?: string
  /**
   * Number of ms until the data is considered stale. Set to `"static"` to
   * prevent the data from ever going stale.
   */
  frequency?: Frequency
}

export interface IDataset<TData extends any = any> {
  init: () => void
  get: () => Promise<TData>
  isStale: () => boolean
}

export class Dataset<TData extends any = any, TNewData extends any = TData>
  implements IDataset
{
  node: Node
  channel: string

  // keep this around to rerun during validation
  initializer?: Fetcher<TNewData>

  fetcher: Fetcher<TNewData>
  loader: ILoader<TData, TNewData>
  currentCID?: string
  cache: Cache<TData>

  // ms
  frequency: Frequency

  // ms
  lastUpdated = 0

  constructor(
    node: Node,
    channel: string,
    fetcher: Fetcher,
    loader: ILoader,
    options?: IDatasetOptions
  ) {
    const {
      initializer,
      initialContentId,
      frequency = 'static',
    } = options || {}

    this.node = node
    this.channel = channel
    this.initializer = initializer
    this.fetcher = fetcher
    this.loader = loader
    this.currentCID = initialContentId
    this.cache = new Cache()
    this.frequency = frequency
  }

  /**
   * Factory method to return a strongly typed instance.
   */
  static create<TData extends any = any, TNewData extends any = TData>(
    node: Node,
    channel: string,
    fetcher: Fetcher<TNewData>,
    loader: ILoader<TData, TNewData>,
    options?: IDatasetOptions
  ): Dataset<TData, TNewData> {
    return new Dataset(node, channel, fetcher, loader, options)
  }

  private async fetchWith(fetcher: Fetcher<TNewData>) {
    // TODO: add to queue / toggle isFetching
    const newData = await fetcher()
    return this.update(newData)
  }

  private async update(newData: TNewData) {
    const { contentId, data, json } = await this.loader.load(
      newData,
      this.currentCID
    )

    this.currentCID = contentId
    this.cache.set(data)
    this.lastUpdated = Date.now()
    this.node.upload(contentId)

    return data
  }

  init() {
    const frequency = this.frequency === 'static' ? Infinity : this.frequency
    this.node.connect(this.channel, frequency)

    if (this.initializer) {
      this.fetchWith(this.initializer)
    }
  }

  get(): Promise<TData> {
    if (this.isStale()) {
      return this.fetchWith(this.fetcher)
    }
    return Promise.resolve(this.cache.get())
  }

  isStale(): boolean {
    if (this.frequency === 'static') {
      return false
    }

    // Using `>=` since "frequency" feels like "update every n milliseconds",
    // whereas `>` would fit better for "keep alive for n milliseconds"
    return Date.now() - this.lastUpdated >= this.frequency
  }
}
