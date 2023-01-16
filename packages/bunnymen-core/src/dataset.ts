import { EventEmitter } from 'events'
import { ILoader, IPayload } from './loader.js'
import { Node } from './node.js'
import { Cache } from './cache'

export type Fetcher<TData = any> = () => TData | Promise<TData>

// 'static' = never stale
export type Frequency = number | 'static'

export interface IDatasetEvents<TData = any> {
  updated: (payload: IPayload<TData>) => void
}

export interface IDatasetOptions<TData = any> {
  initializer?: Fetcher<TData>
  initialContentId?: string
  /**
   * Number of ms until the data is considered stale. Set to `"static"` to
   * prevent the data from ever going stale.
   */
  frequency?: Frequency
}

export interface IDataset<TData = any, TNewData = TData> extends EventEmitter {
  init: () => Promise<void>
  get: () => Promise<TData>
  set: (newData: TNewData) => Promise<TData>
  subscribe: (handler: (payload: IPayload<TData>) => void) => void
  on: <K extends keyof IDatasetEvents<TData>>(
    event: K,
    listener: IDatasetEvents<TData>[K]
  ) => this
  emit: <K extends keyof IDatasetEvents<TData>>(
    event: K,
    ...args: Parameters<IDatasetEvents<TData>[K]>
  ) => boolean
  get peerId(): string
  get peers(): string[]
}

export class Dataset<TData = any, TNewData = TData>
  extends EventEmitter
  implements IDataset<TData, TNewData>
{
  private node: Node
  // keep this around to rerun during validation
  private initializer: Fetcher<TNewData>
  private fetcher: Fetcher<TNewData>
  private loader: ILoader<TData, TNewData>
  private currentCID?: string
  private cache: Cache<TData>
  private untypedOn = this.on
  private untypedEmit = this.emit
  public on = <K extends keyof IDatasetEvents<TData>>(
    event: K,
    listener: IDatasetEvents<TData>[K]
  ): this => this.untypedOn(event, listener)
  public emit = <K extends keyof IDatasetEvents<TData>>(
    event: K,
    ...args: Parameters<IDatasetEvents<TData>[K]>
  ): boolean => this.untypedEmit(event, ...args)

  get peerId() {
    return this.node.peerId
  }
  get peers() {
    return this.node.peers
  }

  // ms
  frequency: Frequency

  // unix timestamp
  lastUpdated = 0

  constructor(
    node: Node,
    fetcher: Fetcher,
    loader: ILoader,
    options?: IDatasetOptions<TData>
  ) {
    super()
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
  static create<TData = any, TNewData = TData>(
    node: Node,
    fetcher: Fetcher<TNewData>,
    loader: ILoader<TData, TNewData>,
    options?: IDatasetOptions<TData>
  ): Dataset<TData, TNewData> {
    return new Dataset(node, fetcher, loader, options)
  }

  private update(payload: IPayload<TData>, cid: string) {
    this.currentCID = cid
    this.cache.set(payload.data)
    this.lastUpdated = payload.lastUpdated
    this.emit('updated', payload)
    return payload.data
  }

  private async fetchWith(fetcher: Fetcher<TNewData>) {
    const data = await fetcher()
    const { cid, payload } = await this.loader.init(this.node, data)
    return this.update(payload, cid)
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
    this.node.on('receivedMessage', async (newCID) => {
      const newPayload = await this.loader.download(this.node, newCID)
      if (newPayload.lastUpdated > this.lastUpdated) {
        this.update(newPayload, newCID)
      } else {
        const { payload, cid } = await this.loader.loadHistorical(
          this.node,
          newPayload.data,
          this.currentCID as string
        )
        this.update(payload, cid)
      }
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
    const { cid, payload } = await this.loader.load(
      this.node,
      newData,
      this.currentCID
    )
    await this.node.sendMessage(cid)
    return this.update(payload, cid)
  }

  subscribe(handler: (payload: IPayload<TData>) => void) {
    this.on('updated', handler)
  }
}
