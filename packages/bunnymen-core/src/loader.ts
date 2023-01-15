import stringify from 'fast-json-stable-stringify'
import toBuffer from 'it-to-buffer'
import { Node } from './node.js'
import { Transformer } from './types.js'

export interface IPayload<TData> {
  data: TData
  // unix timestamp
  lastUpdated: number
}

export interface ILoader<TData extends any = any> {
  /**
   * @returns CID
   */
  init: (node: Node, data: TData) => Promise<string>
  load: (
    node: Node,
    newData: TData,
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

export class Loader<TData extends any = any>
  implements ILoader<TData>
{
  private aggregator?: Transformer<[TData | undefined, TData], TData>

  constructor(
    aggregator?: Transformer<[TData | undefined, TData], TData>,
  ) {
    this.aggregator = aggregator
  }

  /**
   * Factory method to return a strongly typed instance.
   */
  static create<TData extends any = any>(
    aggregator?: Transformer<[TData | undefined, TData], TData>,
  ): Loader<TData> {
    return new Loader(aggregator)
  }

  init(node: Node, data: TData) {
    return node.upload(stringify(data))
  }

  async load(node: Node, newData: TData, currentCID?: string) {
    const payload = {
      data: newData as unknown as TData,
      lastUpdated: Date.now(),
    }
    if (this.aggregator) {
      let currentPayload: IPayload<TData> | undefined = undefined
      if (!!currentCID) {
        const json = await node.download(currentCID)
        currentPayload = JSON.parse(json)
      }
      payload.data = this.aggregator(currentPayload?.data, newData)
    }
    const cid = await node.upload(stringify(payload))
    return { cid, payload }
  }

  async loadHistorical(node: Node, oldData: TData, currentCID: string) {
    const payload = {
      data: oldData,
      lastUpdated: Date.now(),
    }
    if (this.aggregator) {
      const currentJSON = await node.download(currentCID)
      const currentPayload = JSON.parse(currentJSON)
      console.log
      payload.data = this.aggregator(oldData, currentPayload.data)
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
