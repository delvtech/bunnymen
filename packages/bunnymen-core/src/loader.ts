import stringify from 'fast-json-stable-stringify'
import toBuffer from 'it-to-buffer'
import { Node } from './node.js'
import { Transformer } from './types.js'

export interface IPayload<TData> {
  data: TData
  // unix timestamp
  lastUpdated: number
}

export interface ILoader<
  TData extends any = any,
  TNewData extends any = TData
> {
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
    oldData: TData,
    currentCID: string
  ) => Promise<{
    cid: string
    payload: IPayload<TData>
  }>
  download: (node: Node, cid: string) => Promise<IPayload<TData>>
}

export class Loader<TData extends any = any, TNewData extends any = TData>
  implements ILoader<TData, TNewData>
{
  private aggregator?: Transformer<[TData | undefined, TNewData], TData>
  private historicalAggregator?: Transformer<[TData, TData | undefined], TData>

  constructor(
    aggregator?: Transformer<[TData | undefined, TNewData], TData>,
    historicalAggregator?: Transformer<[TData, TData | undefined], TData>
  ) {
    this.aggregator = aggregator
    this.historicalAggregator = historicalAggregator
  }

  /**
   * Factory method to return a strongly typed instance.
   */
  static create<TData extends any = any, TNewData extends any = TData>(
    aggregator?: Transformer<[TData | undefined, TNewData], TData>,
    historicalAggregator?: Transformer<[TData, TData | undefined], TData>
  ): Loader<TData, TNewData> {
    return new Loader(aggregator)
  }

  init(node: Node, data: TData) {
    return node.upload(stringify(data))
  }

  async load(node: Node, newData: TNewData, currentCID?: string) {
    const payload = {
      data: newData as unknown as TData,
      lastUpdated: Date.now(),
    }
    if (this.aggregator) {
      let currentData: TData | undefined = undefined
      if (!!currentCID) {
        const json = await node.download(currentCID)
        currentData = JSON.parse(json)
      }
      payload.data = this.aggregator(currentData, newData)
    }
    const cid = await node.upload(stringify(payload))
    return { cid, payload }
  }

  async loadHistorical(node: Node, oldData: TData, currentCID: string) {
    const payload = {
      data: oldData,
      lastUpdated: Date.now(),
    }
    if (this.historicalAggregator) {
      console.log('has agg')
      const currentJSON = await node.download(currentCID)
      const currentData = JSON.parse(currentJSON)
      payload.data = this.historicalAggregator(oldData, currentData)
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
