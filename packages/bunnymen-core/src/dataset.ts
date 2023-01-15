import { ILoader, IPayload } from './loader.js'
import { Node } from './node.js'
import { Cache } from './cache.js'

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

export interface IDataset<
  TData extends any = any,
  TNewData extends any = TData
> {
  init: () => Promise<void>
  get: () => Promise<TData>
  set: (newData: TNewData) => Promise<void>
  subscribe: (handler: (payload: IPayload<TData>) => void) => void
}

export class Dataset<TData extends any = any, TNewData extends any = TData>
  implements IDataset<TData, TNewData>
{
  private node: Node
  // keep this around to rerun during validation
  private initializer: Fetcher<TData>
  private fetcher: Fetcher<TData>
  private loader: ILoader<TData, TNewData>
  private currentCID?: string
  private cache: Cache<TData>

  // ms
  frequency: Frequency

  // ms
  lastUpdated = 0

  constructor(
    node: Node,
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
    this.initializer = initializer ?? fetcher
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
    fetcher: Fetcher<TNewData>,
    loader: ILoader<TData, TNewData>,
    options?: IDatasetOptions
  ): Dataset<TData, TNewData> {
    return new Dataset(node, fetcher, loader, options)
  }

  private update(payload: IPayload<TData>, cid: string) {
    this.currentCID = cid
    this.cache.set(payload.data)
    this.lastUpdated = payload.lastUpdated
    return payload.data
  }

  private async fetchWith(fetcher: Fetcher<TData>) {
    // TODO: add to queue / toggle isFetching
    const data = await fetcher()
    const cid = await this.loader.init(this.node, data)
    return this.update(
      {
        data,
        lastUpdated: Date.now(),
      },
      cid
    )
  }

  private isStale(): boolean {
    if (this.frequency === 'static') {
      return false
    }

    // Using `>=` since "frequency" feels like "update every n milliseconds",
    // whereas `>` would fit better for "keep alive for n milliseconds"
    return Date.now() - this.lastUpdated >= this.frequency
  }

  async init() {
    // download the latest payload after a peer sends a new CID
    this.node.on('receivedMessage', async (cid) => {
      const payload = await this.loader.download(this.node, cid)
      if (payload.lastUpdated > this.lastUpdated) {
        console.log('recieved new data')
        this.update(payload, cid)
      } else {
        console.log('recieved old data')
        await this.loader.loadHistorical(
          this.node,
          payload.data,
          this.currentCID as string
        )
      }
    })

    // TODO: is this needed? download data when its uploaded
    this.node.on('uploadedData', (cid: string) => {
      this.loader.download(this.node, cid)
    })

    this.node.on('peerSubscribed', (peerId) => {
      // only if there is a cid to send
      if (!!this.currentCID && this.node.isLeader()) {
        // send latest cid when we see that a node has joined the channel
        this.node.sendMessage(this.currentCID)
      } else {
        console.log(
          'DATASET: no data has been uploaded yet so there is no message to send'
        )
      }
      console.log('DATASET: peer subscribed ' + peerId)
    })

    // listen for messages (new CIDs)
    this.node.subscribe()

    // check for new peers
    this.node.poll(5000)
  }

  get(): Promise<TData> {
    if (!this.lastUpdated) {
      return this.fetchWith(this.initializer)
    }
    if (this.isStale()) {
      return this.fetchWith(this.fetcher)
    }
    return Promise.resolve(this.cache.get())
  }

  async set(newData: TNewData) {
    const { cid, payload } = await this.loader.load(this.node, newData)
    this.update(payload, cid)
    await this.node.sendMessage(cid)
  }

  subscribe(handler: (payload: IPayload<TData>) => void) {
    this.node.on('uploadedData', async (cid: string) => {
      const payload = await this.loader.download(this.node, cid)
      handler(payload)
    })
  }
}
