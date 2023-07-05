export type TypeForGame = 'attack' | 'randomAttack' | 'turn' | 'finish'

export interface AttackDataReq {
  gameID: number
  x: number
  y: number
  indexPlayer: number
}

export interface AttackDataRes {
  position: { x: number; y: number }
  currentPlayer: number
  status: 'miss' | 'killed' | 'shot'
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
  currentPlayer: number
  id: 0
}

export interface FinishGameDataRes {
  winPlayer: number
}
export interface FinishGameRes {
  type: 'finish'
  winPlayer: number
  id: 0
}
