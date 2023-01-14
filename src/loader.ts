import stringify from 'fast-json-stable-stringify'
import toBuffer from 'it-to-buffer'
import { IPFS, create } from 'ipfs-core'
import { Transformer } from './types'

export interface ILoader<
  TData extends any = any,
  TNewData extends any = TData,
> {
  load: (
    newData: TNewData,
    currentCID?: string,
  ) => Promise<{
    contentId: string
    data: TData
    json: string
  }>
}

/**
 * Uploads data to IPFS as JSON
 */
export class Loader<TData extends any = any, TNewData extends any = TData>
  implements ILoader<TData, TNewData>
{
  private aggregator?: Transformer<[TData, TNewData], TData>
  private ipfs: Promise<IPFS>

  constructor(aggregator?: Transformer<[TData, TNewData], TData>) {
    this.aggregator = aggregator
    this.ipfs = create()
  }

  /**
   * Factory method to return a strongly typed instance.
   */
  static create<TData extends any = any, TNewData extends any = TData>(
    aggregator?: Transformer<[TData, TNewData], TData>,
  ): Loader<TData, TNewData> {
    return new Loader(aggregator)
  }

  private async fetch(contentId: string): Promise<TData> {
    const ipfs = await this.ipfs
    const buffer = await toBuffer(ipfs.cat(contentId))
    const json = String.fromCharCode(...buffer)
    return JSON.parse(json)
  }

  async load(newData: TNewData, currentCID?: string) {
    let data = newData as unknown as TData

    if (currentCID && this.aggregator) {
      const currentData = await this.fetch(currentCID)
      data = await this.aggregator(currentData, newData)
    }

    const json = stringify(data)

    const blob = new Blob([json], { type: 'application/json' })
    const ipfs = await this.ipfs
    const { cid } = await ipfs.add(blob)

    return {
      contentId: cid.toString(),
      data,
      json,
    }
  }
}
