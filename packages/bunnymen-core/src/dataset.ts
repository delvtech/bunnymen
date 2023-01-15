import stringify from 'fast-json-stable-stringify'
import { ILoader } from './loader.js'
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

export interface IDataset<TData extends any = any> {
  init: () => Promise<void>
  get: () => Promise<TData>
  set: (newData: TData) => Promise<void>
  subscribe: (handler: (data: TData) => void) => void
}

export class Dataset<TData extends any = any> implements IDataset<TData> {
  private node: Node
  // keep this around to rerun during validation
  private initializer: Fetcher<TData>
  private fetcher: Fetcher<TData>
  private loader: ILoader<TData, TData>
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
  ): Dataset<TData> {
    return new Dataset(node, fetcher, loader, options)
  }

  private update(data: TData, cid: string) {
    console.log('DATASET: update')
    this.currentCID = cid
    this.cache.set(data)
    this.lastUpdated = Date.now()
    return data
  }

  private async fetchWith(fetcher: Fetcher<TData>) {
    console.log('DATASET: fetchWith')
    // TODO: add to queue / toggle isFetching
    const newData = await fetcher()
    const { data, cid } = await this.loader.load(
      this.node,
      newData,
      this.currentCID
    )
    return this.update(data, cid)
  }

  private isStale(): boolean {
    console.log('DATASET: isStale')
    if (this.frequency === 'static') {
      return false
    }

    // Using `>=` since "frequency" feels like "update every n milliseconds",
    // whereas `>` would fit better for "keep alive for n milliseconds"
    return Date.now() - this.lastUpdated >= this.frequency
  }

  async init() {
    console.log('DATASET: init')
    // download the latest data after a peer sends a new CID
    this.node.on('receivedMessage', async (cid) => {
      console.log('DATASET: received message', cid)
      const data = await this.loader.download(this.node, cid)
      this.update(data, cid)
    })

    // download 
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
    console.log('DATASET: get')
    if (!this.lastUpdated) {
      return this.fetchWith(this.initializer)
    }
    if (this.isStale()) {
      return this.fetchWith(this.fetcher)
    }
    return Promise.resolve(this.cache.get())
  }

  async set(newData: TData) {
    const cid = await this.node.upload(stringify(newData))
    console.log('DATASET: set to', newData, 'resulting in cid', cid)
    this.update(newData, cid)
    await this.node.sendMessage(cid)
  }

  subscribe(handler: (data: TData) => void) {
    console.log('DATASET: subscribe')
    this.node.on('downloadedData', (json: string) => {
      console.log('DATASET: downloaded data', json)
      handler(JSON.parse(json))
    })
  }
}
