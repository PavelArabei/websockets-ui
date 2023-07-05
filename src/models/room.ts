export type TypeForRoom = 'create_room' | 'add_player_to_room' | 'create_game' | 'update_room'
export interface NewRoomReq {
  type: 'create_room'
  data: ''
  id: 0
}

export interface PlayerToRoomDataReq {
  indexRoom: number
}

export interface PlayerToRoomReq {
  type: 'add_player_to_room'
  data: PlayerToRoomDataReq
  id: 0
}
export interface PlayerToRoomDataRes {
  idGame: number
  idPlayer: number
}
export interface PlayerToRoomRes {
  type: 'create_game'
  data: PlayerToRoomDataRes
  id: 0
}

export interface RoomUser {
  name: string
  index: number
}
export interface RoomInfo {
  roomId: number
  roomUsers: RoomUser[]
}

export interface RoomStateRes {
  type: 'update_room'
  data: RoomInfo[]
  id: 0
}
