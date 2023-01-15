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

export class BunnymenDB implements IBunnymenDB {
  private datasets: Record<string, IDataset[]> = {}
  private transformers: Record<string | never, Transformer> = {}

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
  }

  // TODO: how to add strong types to key arg and return value
  async get(key: string) {
    console.log('BUNNYMEN: getting', key)
    const datasets = this.datasets[key]

    if (!datasets) {
      // console.log('BUNNYMEN: no datasets for', key)
      return null
    }

    const rawDatas = []

    for (const dataset of datasets) {
      const rawData = await dataset.get()
      rawDatas.push(rawData)
    }

    // console.log('BUNNYMEN: rawDatas for', key, rawDatas)

    const transformer = this.transformers[key]

    if (transformer) {
      // console.log('BUNNYMEN: transformer for', key, transformer)
      return transformer(...rawDatas)
    }

    if (rawDatas.length === 1) {
      // console.log('BUNNYMEN: returning', rawDatas[0], 'for', key)
      return rawDatas[0]
    }

    return rawDatas
  }

  async set(key: string, data: any) {
    const datasets = this.datasets[key]

    for (const dataset of datasets) {
      console.log('BUNNYMEN: setting', key, 'to', data)
      await dataset.set(data)
    }
  }

  subscribe(key: string, handler: (data: any) => void) {
    const datasets = this.datasets[key]

    // what happens if a dataset is registered after I've already subscribed?
    if (!datasets) {
      return false
    }

    for (const dataset of datasets) {
      dataset.subscribe(handler)
    }
  }
}
