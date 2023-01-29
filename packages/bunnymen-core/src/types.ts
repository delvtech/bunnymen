// shared types go here

export type Transformer<TRawData extends any[] = any[], TData = any> = (
  ...rawData: TRawData
) => TData | Promise<TData>

export interface IPayload<TData> {
  data: TData
  // unix timestamp
  lastUpdated: number
}
