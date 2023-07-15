import {
  RegDataReq,
  RegDataRes,
  TypeForPlayer,
  UpdateWinDataRes,
} from './player.js'
import {
  PlayerToRoomDataReq,
  PlayerToRoomDataRes,
  Room,
  TypeForRoom,
} from './room.js'
import { ShipReqData, ShipResData, TypeForShips } from './sheeps.js'
import {
  AttackDataReq,
  AttackDataRes,
  FinishGameDataRes,
  PlayerTernDataRes,
  RandomAttackDataReq,
  TypeForGame,
} from './game.js'
import WebSocket from 'ws'

export type MessageType =
  | TypeForPlayer
  | TypeForRoom
  | TypeForShips
  | TypeForGame

export interface WsMessageReq {
  type: MessageType
  data:
    | ''
    | RegDataReq
    | PlayerToRoomDataReq
    | ShipReqData
    | AttackDataReq
    | RandomAttackDataReq
  id: 0
}
export type ResponseData =
  | RegDataRes
  | UpdateWinDataRes[]
  | PlayerToRoomDataRes
  | Room[]
  | ShipResData
  | AttackDataRes
  | PlayerTernDataRes
  | FinishGameDataRes

export interface WsResponseToString {
  type: MessageType
  data: ResponseData
  id: 0
}

export interface MyWebSocket extends WebSocket {
  id: number
}

export type Server = WebSocket.Server<typeof WebSocket>
