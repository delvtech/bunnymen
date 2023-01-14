import { IDataset } from './dataset'
import { Transformer } from './types'

export interface IBunnymenDB {
  registerDatasets: (key: string, ...dataSets: IDataset[]) => boolean
  registerTransformer: (key: string, transformer: Transformer) => boolean
  init: () => void
  get: <TData extends any = any>(key: string) => Promise<TData>
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

  init() {
    const datasetArrays = Object.values(this.datasets)
    const allDatasets = ([] as IDataset[]).concat(...datasetArrays)
    for (const dataset of allDatasets) {
      dataset.init()
    }
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
}
