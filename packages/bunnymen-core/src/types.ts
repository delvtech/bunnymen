import { EventEmitter } from 'events'

// shared types go here

export type Transformer<
  TRawData extends any[] = any[],
  TData extends any = any
> = (...rawData: TRawData) => TData

export type IEvents = Record<string, (property: any) => void>

export interface TypedEventEmitter<TEvents extends IEvents> {
  on: <K extends keyof TEvents>(event: K, listener: TEvents[K]) => this
  emit: <K extends keyof TEvents>(
    event: K,
    ...args: Parameters<TEvents[K]>
  ) => boolean
}
