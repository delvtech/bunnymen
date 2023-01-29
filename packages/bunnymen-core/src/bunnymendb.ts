import { EventEmitter } from 'events'
import { IDataset } from './dataset.js'
import { Transformer } from './types.js'

export interface IBunnymenDB {
  registerDatasets: (key: string, ...dataSets: IDataset[]) => boolean
  registerTransformer: (key: string, transformer: Transformer) => boolean
  init: () => void
  get: <TData extends any = any>(key: string) => Promise<TData>
  set: (key: string, data: any) => Promise<void>
  subscribe: (key: string, handler: (data: any) => void) => void
}

export interface IBunnymentEvents {
  /**
   * Fired when init is complete.
   */
  ready: () => void
}

export class BunnymenDB extends EventEmitter implements IBunnymenDB {
  private datasets: Record<string, IDataset[]> = {}
  private transformers: Record<string | never, Transformer> = {}
  private untypedOn = this.on
  private untypedEmit = this.emit
  public override on = <K extends keyof IBunnymentEvents>(
    event: K,
    listener: IBunnymentEvents[K],
  ): this => this.untypedOn(event, listener)
  public override emit = <K extends keyof IBunnymentEvents>(
    event: K,
    ...args: Parameters<IBunnymentEvents[K]>
  ): boolean => this.untypedEmit(event, ...args)

  get peers() {
    const flattened = ([] as IDataset[]).concat(...Object.values(this.datasets))
    return ([] as string[]).concat(...flattened.map((dataset) => dataset.peers))
  }

  constructor() {
    super()
  }

  registerDatasets(key: string, ...datasets: IDataset[]) {
    this.datasets[key] = [...(this.datasets[key] || []), ...datasets]
    return true
  }

  registerTransformer(key: string, transformer: Transformer) {
    this.transformers[key] = transformer
    return true
  }

  async init(): Promise<void> {
    const datasetArrays = Object.values(this.datasets)
    const allDatasets = ([] as IDataset[]).concat(...datasetArrays)
    await Promise.all(allDatasets.map((dataset) => dataset.init()))
    this.emit('ready')
  }

  // TODO: how to add strong types to key arg and return value
  async get(key: string) {
    const datasets = this.datasets[key]
    if (!datasets) {
      return null
    }

    const rawDatas = []
    for (const dataset of datasets) {
      const rawData = await dataset.get()
      rawDatas.push(rawData)
    }

    const transformer = this.transformers[key]
    if (transformer) {
      return transformer(...rawDatas)
    }

    if (rawDatas.length === 1) {
      return rawDatas[0]
    }

    return rawDatas
  }

  /**
   * This calls `set()` on every dataset registered for the key. To only update
   * a single one, call `set()` on the dataset directly.
   */
  async set(key: string, data: any) {
    const datasets = this.datasets[key]
    if (datasets) {
      for (const dataset of datasets) {
        await dataset.set(data)
      }
    }
  }

  subscribe(key: string, handler: (data: any) => void) {
    const datasets = this.datasets[key]

    // what happens if a dataset is registered after I've already subscribed?
    if (!datasets) {
      return
    }

    for (const dataset of datasets) {
      dataset.on('updated', handler)
    }
  }
}
