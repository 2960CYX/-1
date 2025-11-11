export interface RuoYiResponse<TData = unknown, TRows = unknown> {
  code: number
  msg: string
  data?: TData
  rows?: TRows
  total?: number
}

export type RuoYiDataResponse<T> = RuoYiResponse<T, undefined>

export type RuoYiListResponse<T> = RuoYiResponse<undefined, T[]>
