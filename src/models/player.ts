export type TypeForPlayer = 'reg' | 'update_winners'
export interface RegDataReq {
  name: string
  password: string
}
export interface RegDataRes {
  name: string
  index: number
  error: boolean
  errorText: string
}

export interface LoginReq {
  type: 'reg'
  data: RegDataReq
  id: 0
}
export interface LoginRes {
  type: 'reg'
  data: RegDataRes
  id: 0
}

export interface UpdateWinDataRes {
  name: string
  wins: number
}

export interface UpdateWinRes {
  type: 'update_winners'
  data: UpdateWinDataRes[]
  id: 0
}
