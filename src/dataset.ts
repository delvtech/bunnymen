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
  implements IDataset<TData>
{
  private node: Node
  // keep this around to rerun during validation
  private initializer?: Fetcher<TNewData>
  private fetcher: Fetcher<TNewData>
  private loader: ILoader<TData, TNewData>
  private currentCID?: string
  private cache: Cache<TData>

  // ms
  private frequency: Frequency

  // ms
  private lastUpdated = 0

  topic: string

  constructor(
    topic: string,
    fetcher: Fetcher,
    loader: ILoader,
    options?: IDatasetOptions,
  ) {
    const {
      initializer,
      initialContentId,
      frequency = 'static',
    } = options || {}

    this.node = new Node(topic)
    this.topic = topic
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
    topic: string,
    fetcher: Fetcher<TNewData>,
    loader: ILoader<TData, TNewData>,
    options?: IDatasetOptions,
  ): Dataset<TData, TNewData> {
    return new Dataset(topic, fetcher, loader, options)
  }

  private async fetchWith(fetcher: Fetcher<TNewData>) {
    // TODO: add to queue / toggle isFetching
    const newData = await fetcher()
    return this.update(newData)
  }

  private async update(newData: TNewData) {
    const { contentId, data, json } = await this.loader.load(
      newData,
      this.currentCID,
    )

    this.currentCID = contentId
    this.cache.set(data)
    this.lastUpdated = Date.now()
    this.node.upload(contentId)

    return data
  }

  init() {
    this.node.subscribe()

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
