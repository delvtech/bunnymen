import stringify from 'fast-json-stable-stringify'
import toBuffer from 'it-to-buffer'
import { Node } from './node.js'
import { Transformer } from './types.js'

export interface IPayload<TData> {
  data: TData
  // unix timestamp
  lastUpdated: number
}

export interface ILoaderOptions<TData = any, TNewData = TData> {
  /**
   * Used to transform new data coming in
   */
  transformer?: Transformer<[TNewData], TData>
  /**
   * Used to aggregate data instead of overwriting
   */
  aggregator?: Transformer<[TData | undefined, TData], TData>
}

export interface ILoader<TData = any, TNewData = TData> {
  /**
   * @returns CID
   */
  init: (node: Node, data: TData) => Promise<string>
  load: (
    node: Node,
    newData: TNewData,
    currentCID?: string
  ) => Promise<{
    cid: string
    payload: IPayload<TData>
  }>
  loadHistorical: (
    node: Node,
    oldData: TNewData,
    currentCID: string
  ) => Promise<{
    cid: string
    payload: IPayload<TData>
  }>
  download: (node: Node, cid: string) => Promise<IPayload<TData>>
}

export class Loader<TData = any, TNewData = TData>
  implements ILoader<TData, TNewData>
{
  private transformer?: Transformer<[TData], TData>
  private aggregator?: Transformer<[TData | undefined, TData], TData>

  constructor(options?: ILoaderOptions) {
    this.transformer = options?.transformer
    this.aggregator = options?.aggregator
  }

  /**
   * Factory method to return a strongly typed instance.
   */
  static create<TData = any, TNewData = any>(
    options?: ILoaderOptions<TData, TNewData>
  ): Loader<TData, TNewData> {
    return new Loader(options)
  }

  init(node: Node, data: TData) {
    return node.upload(stringify(data))
  }

  async load(node: Node, newData: TNewData, currentCID?: string) {
    const payload = {
      data: newData as unknown as TData,
      lastUpdated: Date.now(),
    }
    if (this.transformer) {
      payload.data = this.transformer(payload.data)
    }
    if (this.aggregator) {
      let currentPayload: IPayload<TData> | undefined = undefined
      if (!!currentCID) {
        const json = await node.download(currentCID)
        currentPayload = JSON.parse(json)
      }
      payload.data = this.aggregator(currentPayload?.data, payload.data)
    }
    const cid = await node.upload(stringify(payload))
    return { cid, payload }
  }

  async loadHistorical(node: Node, oldData: TNewData, currentCID: string) {
    const payload = {
      data: oldData as unknown as TData,
      lastUpdated: Date.now(),
    }
    if (this.transformer) {
      payload.data = this.transformer(payload.data)
    }
    if (this.aggregator) {
      const currentJSON = await node.download(currentCID)
      const currentPayload = JSON.parse(currentJSON)
      payload.data = this.aggregator(payload.data, currentPayload.data)
    }
    const cid = await node.upload(stringify(payload))
    return {
      cid,
      payload,
    }
  }

  async download(node: Node, cid: string) {
    const json = await node.download(cid)
    return JSON.parse(json)
  }
}
