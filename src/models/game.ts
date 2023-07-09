import { Ship } from './sheeps.js'
import { Coordinates } from '../utils/crateObects.js'

export type TypeForGame = 'attack' | 'randomAttack' | 'turn' | 'finish'

export interface AttackDataReq {
  gameId: number
  x: number
  y: number
  indexPlayer: number
}

export type ShutStatus = 'miss' | 'killed' | 'shot'

export interface AttackDataRes {
  position: Coordinates
  currentPlayer: number
  status: ShutStatus
}
export interface AttackReq {
  type: 'attack'
  data: AttackDataReq
  id: 0
}

export interface AttackRes {
  type: 'attack'
  data: AttackDataRes
  id: 0
}
////////////////////////////////////////////////////

export interface RandomAttackDataReq {
  gameID: number
  indexPlayer: number
}

export interface RandomAttackReq {
  type: 'randomAttack'
  data: RandomAttackDataReq
  id: 0
}
/////////////////////////////////////////////////

export interface PlayerTernDataRes {
  currentPlayer: number
}
export interface PlayerTernRes {
  type: 'turn'
  data: PlayerTernDataRes
  id: 0
}

export interface FinishGameDataRes {
  winPlayer: number
}
export interface FinishGameRes {
  type: 'finish'
  data: FinishGameDataRes
  id: 0
}
export interface PlayerFields {
  playerId: number
  matrixBattlefield: Battlefield
  frontBattlefield: Ship[]
  shoutedCount: number
}

export interface Game {
  idGame: number
  idPlayerOne: number
  idPlayerTwo: number
  fields: {
    [key: string]: PlayerFields
    // playerTwo: PlayerFields
  }
  turnIndex: number
}

export type Battlefield = number[][]

export interface HitRegister {
  battlefield: Battlefield
  x: number
  y: number
  currentPlayer: number
}
