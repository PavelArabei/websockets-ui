import { RegDataReq, TypeForPlayer } from './player.js'
import { PlayerToRoomDataReq, TypeForRoom } from './room.js'
import { ShipReqData, TypeForShips } from './sheeps.js'
import { AttackDataReq, RandomAttackDataReq, TypeForGame } from './game.js'

export type MessageType = TypeForPlayer | TypeForRoom | TypeForShips | TypeForGame

export interface WsMessageReq {
  type: MessageType
  data: '' | RegDataReq | PlayerToRoomDataReq | ShipReqData | AttackDataReq | RandomAttackDataReq
  id: 0
}
