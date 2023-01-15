// shared types go here

export type Transformer<
  TRawData extends any[] = any[],
  TData extends any = any
> = (...rawData: TRawData) => TData