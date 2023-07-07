import { LoginReq, RegDataRes } from '../models/player.js'
import { MessageType, MyWebSocket, ResponseData, Server } from '../models/ws.js'
import { generateResponse } from '../utils/generateResponse.js'
import { stringifyWsMessage } from '../utils/stringifyWsMessage.js'
import {
  NewRoomReq,
  PlayerToRoomDataRes,
  PlayerToRoomReq,
  Room,
} from '../models/room.js'
import { sendMessageToAllUsers } from '../utils/sendMessageToAllUsers.js'
import { Game } from '../models/game.js'
import { generateUniNumb } from '../utils/generateUniNumb.js'
import { sendMessageToCurrentUser } from '../utils/sendMessageToCurrentUser.js'

export class WsServerHandler {
  private users: RegDataRes[] = []
  private rooms: Room[] = []
  private games: Game[] = []

  public registerUser = (message: LoginReq, ws: MyWebSocket) => {
    const { name } = message.data
    const user: RegDataRes = {
      name,
      index: ws.id,
      error: false,
      errorText: '',
    }
    this.users.push(user)

    const response = this.getResponse(message.type, user)

    ws.send(response)
  }
  public createRoom = (
    message: NewRoomReq,
    ws: MyWebSocket,
    server: Server,
  ) => {
    const existedRoom = this.rooms.find(({ roomId }) => ws.id === roomId)
    if (existedRoom) return

    const user = this.users.find(({ index }) => ws.id === index)
    if (!user) return

    const room: Room = this.createRoomObj(ws.id, user.name, user.index)
    this.rooms.push(room)

    this.updateRoom(server)
  }

  updateRoom = (server: Server) => {
    const rooms = this.rooms
    const response = this.getResponse('update_room', rooms)
    sendMessageToAllUsers(server, response)
  }

  createGame = (message: PlayerToRoomReq, ws: MyWebSocket, server: Server) => {
    const roomIndex = message.data.indexRoom
    if (roomIndex === ws.id) return

    const game: Game = {
      idGame: generateUniNumb(6),
      idPlayerOne: roomIndex,
      idPlayerTwo: ws.id,
    }
    this.games.push(game)

    const firstPlayerData: PlayerToRoomDataRes = {
      idGame: game.idGame,
      idPlayer: game.idPlayerOne,
    }
    const secondPlayerData: PlayerToRoomDataRes = {
      idGame: game.idGame,
      idPlayer: game.idPlayerTwo,
    }

    const firstPlayerMessage = this.getResponse('create_game', firstPlayerData)
    const secondPlayerMessage = this.getResponse(
      'create_game',
      secondPlayerData,
    )

    sendMessageToCurrentUser(server, firstPlayerMessage, game.idPlayerOne)
    sendMessageToCurrentUser(server, secondPlayerMessage, game.idPlayerTwo)

    // const gameId = generateUniNumb(6)
    // const playerOneId = roomIndex
    // const playerTwoId = ws.id

    const room = this.rooms.find(({ roomId }) => roomId === roomIndex)
    this.rooms = this.rooms.filter((el) => el !== room)
    this.updateRoom(server)
  }

  private getResponse(type: MessageType, data: ResponseData) {
    const response = generateResponse(type, data)
    return stringifyWsMessage(response)
  }

  private createRoomObj(id: number, name: string, index: number): Room {
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
}
