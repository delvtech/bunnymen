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
  load: (
    node: Node,
    topic: string,
    rawData: TRawData,
    currentCID?: string,
  ) => Promise<{
    cid: string
    payload: IPayload<TData>
  }>
  loadHistorical: (
    node: Node,
    topic: string,
    oldData: TData,
    currentCID: string,
  ) => Promise<{
    cid: string
    payload: IPayload<TData>
  }>
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
    const cid = await node.upload(topic, stringify(payload))
    return { cid, payload }
  }

  async loadHistorical(
    node: Node,
    topic: string,
    oldData: TData,
    currentCID: string,
  ) {
    let payload = await this.download(node, topic, currentCID)
    if (!this.aggregator) {
      return {
        cid: currentCID,
        payload,
      }
    }
    payload.data = await this.aggregator(oldData, payload.data)
    const cid = await node.upload(topic, stringify(payload))
    return { cid, payload }
  }

  async download(node: Node, topic: string, cid: string) {
    const json = await node.download(topic, cid)
    return JSON.parse(json)
  }
}
