import { Battlefield, Game, HitRegister } from '../models/game.js'
import { PlayerToRoomDataRes, Room } from '../models/room.js'
import { RegDataRes } from '../models/player.js'
import { ShipResData } from '../models/sheeps.js'

export const createGameObj = (
  firstPlayerIndex: number,
  secondPlayerIndex: number,
): Game => {
  return {
    idGame: firstPlayerIndex,
    idPlayerOne: firstPlayerIndex,
    idPlayerTwo: secondPlayerIndex,
    fields: {
      [firstPlayerIndex]: {
        playerId: firstPlayerIndex,
        matrixBattlefield: [],
        frontBattlefield: [],
        shoutedCount: 0,
      },
      [secondPlayerIndex]: {
        playerId: secondPlayerIndex,
        matrixBattlefield: [],
        frontBattlefield: [],
        shoutedCount: 0,
      },
    },
    turnIndex: firstPlayerIndex,
  }
}

export const createRoomObj = (id: number, name: string, index: number): Room => {
  return {
    roomId: id,
    roomUsers: [
      {
        name: name,
        index: index,
      },
    ],
  }
}

export const getFirstPlayerData = (
  idGame: number,
  idPlayer: number,
): PlayerToRoomDataRes => {
  return {
    idGame: idGame,
    idPlayer: idPlayer,
  }
}

export const getUser = (
  name: string,
  password: string,
  id: number,
  users: RegDataRes[],
): RegDataRes | undefined => {
  if (password.length < 5 || name.length < 5) return

  const userIndex = users.findIndex((user) => user.name === name)
  if (userIndex !== -1) return

  return {
    name,
    index: id,
    error: false,
    errorText: '',
  }
}

export const getStartGameData = (game: Game): ShipResData[] => {
  const firstPlayer = game.fields[game.idPlayerOne].frontBattlefield
  const secondPlayer = game.fields[game.idPlayerTwo].frontBattlefield

  const firstData: ShipResData = {
    ships: firstPlayer,
    currentPlayerIndex: game.idPlayerOne,
  }

  const secondData: ShipResData = {
    ships: secondPlayer,
    currentPlayerIndex: game.idPlayerOne,
  }
  return [firstData, secondData]
}
export interface Coordinates {
  x: number
  y: number
}

export const createHitRegister = (
  battlefield: Battlefield,
  coordinates: Coordinates,
  currentPlayer: number,
): HitRegister => {
  return {
    battlefield,
    x: coordinates.x,
    y: coordinates.y,
    currentPlayer,
  }
}
