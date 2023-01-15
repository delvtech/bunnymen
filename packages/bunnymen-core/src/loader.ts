import stringify from 'fast-json-stable-stringify'
import toBuffer from 'it-to-buffer'
import { Node } from './node.js'
import { Transformer } from './types.js'

export interface ILoader<
  TData extends any = any,
  TNewData extends any = TData
> {
  load: (
    node: Node,
    newData: TNewData,
    currentCID?: string
  ) => Promise<{
    cid: string
    data: TData
  }>
  download: (
    node: Node,
    cid: string,
  ) => Promise<TData>
}

export class Loader<TData extends any = any, TNewData extends any = TData>
  implements ILoader<TData, TNewData>
{
  private aggregator?: Transformer<[TData, TNewData], TData>

  constructor(aggregator?: Transformer<[TData, TNewData], TData>) {
    this.aggregator = aggregator
  }

  /**
   * Factory method to return a strongly typed instance.
   */
  static create<TData extends any = any, TNewData extends any = TData>(
    aggregator?: Transformer<[TData, TNewData], TData>
  ): Loader<TData, TNewData> {
    return new Loader(aggregator)
  }

  async load(node: Node, newData: TNewData, currentCID?: string) {
    let data: TNewData | TData = newData
    if (currentCID && this.aggregator) {
      const currentData = await node.download(currentCID)
      data = this.aggregator(JSON.parse(currentData), newData)
    }
    const cid = await node.upload(stringify(data))
    return {
      cid,
      data: data as TData,
    }
  }

  async download(node: Node, cid: string) {
    const json = await node.download(cid)
    return JSON.parse(json)
  }
}
