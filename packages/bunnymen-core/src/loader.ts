import stringify from 'fast-json-stable-stringify'
import { Node } from './node.js'
import { IPayload, Transformer } from './types.js'

export interface ILoaderOptions<TData = any, TRawData = TData> {
  /**
   * Used to transform new data coming in
   */
  transformer?: Transformer<[TRawData], TData>
  /**
   * Used to aggregate data instead of overwriting
   */
  aggregator?: Transformer<[TData | undefined, TData], TData>
}

export interface ILoader<TData = any, TRawData = TData> {
  /**
   * Get a payload from raw data and propagate to peers
   */
  load: (
    node: Node,
    topic: string,
    rawData: TRawData,
    currentCID?: string,
  ) => Promise<{
    cid: string
    payload: IPayload<TData>
  }>

  /**
   * Get a payload from merging old transformed data with the current payload
   * and propagate to peers if the merging results in a new payload.
   */
  loadHistorical: (
    node: Node,
    topic: string,
    oldData: TData,
    currentCID: string,
  ) => Promise<{
    cid: string
    payload: IPayload<TData>
  }>
  /**
   * Get a payload from a CID
   */
  download: (node: Node, topic: string, cid: string) => Promise<IPayload<TData>>
}

export class Loader<TData = any, TRawData = TData>
  implements ILoader<TData, TRawData>
{
  private transformer?: Transformer<[TRawData], TData>
  private aggregator?: Transformer<[TData | undefined, TData], TData>

  constructor(options?: ILoaderOptions) {
    this.transformer = options?.transformer
    this.aggregator = options?.aggregator
  }

  /**
   * Factory method to return a strongly typed instance.
   */
  static create<TData = any, TRawData = any>(
    options?: ILoaderOptions<TData, TRawData>,
  ): Loader<TData, TRawData> {
    return new Loader(options)
  }

  private async prepData(newData: TRawData, currentData?: TData) {
    let data: TData | TRawData = newData
    if (this.transformer) {
      data = await this.transformer(data)
    }
    if (this.aggregator) {
      data = await this.aggregator(currentData, data as TData)
    }
    return data as TData
  }

  private async upload(node: Node, topic: string, payload: IPayload<TData>) {
    const json = stringify(payload)
    const cid = await node.upload(topic, json)
    node.sendMessage(topic, cid)
    return cid
  }

  async load(
    node: Node,
    topic: string,
    rawData: TRawData,
    currentCID?: string,
  ) {
    let currentData: TData | undefined
    if (currentCID) {
      const currentPayload = await this.download(node, topic, currentCID)
      currentData = currentPayload.data
    }
    const payload = {
      data: await this.prepData(rawData, currentData),
      lastUpdated: Date.now(),
    }
    const cid = await this.upload(node, topic, payload)
    return { cid, payload }
  }

  async loadHistorical(
    node: Node,
    topic: string,
    oldData: TData,
    currentCID: string,
  ) {
    const currentPayload = await this.download(node, topic, currentCID)
    if (!this.aggregator) {
      return {
        cid: currentCID,
        payload: currentPayload,
      }
    }
    const newPayload = {
      data: await this.aggregator(oldData, currentPayload.data),
      lastUpdated: Date.now(),
    }
    const cid = await this.upload(node, topic, newPayload)
    return {
      cid,
      payload: newPayload,
    }
  }

  async download(node: Node, topic: string, cid: string) {
    const json = await node.download(topic, cid)
    return JSON.parse(json)
  }
}
