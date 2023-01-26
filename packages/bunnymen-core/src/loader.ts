import stringify from 'fast-json-stable-stringify'
import { Node } from './node.js'
import { IPayload, Transformer } from './types.js'

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
   * Ignores aggregator and replaces any existing data.
   */
  init: (
    node: Node,
    topic: string,
    data: TNewData,
  ) => Promise<{
    cid: string
    payload: IPayload<TData>
  }>
  load: (
    node: Node,
    topic: string,
    newData: TNewData,
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

export class Loader<TData = any, TNewData = TData>
  implements ILoader<TData, TNewData>
{
  private transformer?: Transformer<[TNewData], TData>
  private aggregator?: Transformer<[TData | undefined, TData], TData>

  constructor(options?: ILoaderOptions) {
    this.transformer = options?.transformer
    this.aggregator = options?.aggregator
  }

  /**
   * Factory method to return a strongly typed instance.
   */
  static create<TData = any, TNewData = any>(
    options?: ILoaderOptions<TData, TNewData>,
  ): Loader<TData, TNewData> {
    return new Loader(options)
  }

  private async prepData(newData: TNewData, currentData?: TData) {
    let data: TData | TNewData = newData
    if (this.transformer) {
      data = this.transformer(data)
    }
    if (this.aggregator) {
      data = this.aggregator(currentData, data as TData)
    }
    return data as TData
  }

  async init(node: Node, topic: string, data: TNewData) {
    let transformedData = data as unknown as TData
    if (this.transformer) {
      transformedData = this.transformer(data)
    }
    const payload = {
      data: transformedData,
      lastUpdated: Date.now(),
    }
    const cid = await node.upload(topic, stringify(payload))
    return { cid, payload }
  }

  async load(
    node: Node,
    topic: string,
    newData: TNewData,
    currentCID?: string,
  ) {
    let currentData: TData | undefined
    if (currentCID) {
      const currentPayload = await this.download(node, topic, currentCID)
      currentData = currentPayload.data
    }
    const payload = {
      data: await this.prepData(newData, currentData),
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
    return JSON.parse(''.concat(json))
  }
}
