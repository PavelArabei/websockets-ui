export type TypeForShips = 'add_ships' | 'start_game'

export interface Ship {
  position: {
    x: number
    y: number
  }
  direction: boolean
  length: number
  type: 'small' | 'medium' | 'large' | 'huge'
}

export interface ShipReqData {
  gameId: number
  ships: Ship[]
  indexPlayer: number
}

export interface ShipResData {
  ships: Ship[]
  currentPlayerIndex: number
}

export interface AddShipReq {
  type: 'add_ships'
  data: ShipReqData
  id: 0
}

//Start game (only after server receives both player's ships positions)\
export interface AddShipRes {
  type: 'add_ships'
  data: ShipResData
  id: 0
}
