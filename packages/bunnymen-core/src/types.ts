// shared types go here

export type Transformer<
  TRawData extends any[] = any[],
  TData extends any = any
> = (...rawData: TRawData) => TData

export interface IPayload<TData> {
  data: TData
  // unix timestamp
  lastUpdated: number
}