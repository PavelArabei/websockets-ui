import { LoginReq, RegDataRes } from '../models/player.js'
import { MessageType, MyWebSocket, ResponseData, Server } from '../models/ws.js'
import { generateResponse } from '../utils/generateResponse.js'
import { stringifyWsMessage } from '../utils/stringifyWsMessage.js'
import { PlayerToRoomDataReq, Room } from '../models/room.js'
import { sendMessageToAllUsers } from '../utils/sendMessageToAllUsers.js'
import {
  AttackDataReq,
  AttackDataRes,
  Game,
  HitRegister,
  PlayerTernDataRes,
} from '../models/game.js'
import { sendMessageToCurrentUser } from '../utils/sendMessageToCurrentUser.js'
import { ShipReqData } from '../models/sheeps.js'
import {
  createGameObj,
  createHitRegister,
  createRoomObj,
  getFirstPlayerData,
  getStartGameData,
  getUser,
} from '../utils/crateObects.js'
import { generateBattlefield } from '../utils/generateBattlefield.js'
import { hitRegistration } from '../utils/hitRegistration.js'

export class WsServerHandler {
  private users: RegDataRes[] = []
  private rooms: Room[] = []
  private games: Game[] = []

  public registerUser = (message: LoginReq, ws: MyWebSocket, server: Server) => {
    const { name } = message.data
    const user: RegDataRes = getUser(name, ws.id)
    this.users.push(user)

    const response = this.getResponse(message.type, user)
    ws.send(response)
    this.updateRoom(server)
  }

  public createRoom = (ws: MyWebSocket, server: Server) => {
    const existedRoom = this.rooms.find(({ roomId }) => ws.id === roomId)
    if (existedRoom) return

    const user = this.users.find(({ index }) => ws.id === index)
    if (!user) return

    const room: Room = createRoomObj(ws.id, user.name, user.index)
    this.rooms.push(room)

    this.updateRoom(server)
  }

  updateRoom = (server: Server) => {
    const rooms = this.rooms
    const response = this.getResponse('update_room', rooms)
    sendMessageToAllUsers(server, response)
  }

  createGame = (message: PlayerToRoomDataReq, ws: MyWebSocket, server: Server) => {
    const roomIndex = message.indexRoom
    if (roomIndex === ws.id) return

    const game = createGameObj(roomIndex, ws.id)
    this.games.push(game)

    const firstPlayerData = getFirstPlayerData(game.idGame, game.idPlayerOne)
    const secondPlayerData = getFirstPlayerData(game.idGame, game.idPlayerTwo)

    const firstPlayerMessage = this.getResponse('create_game', firstPlayerData)
    const secondPlayerMessage = this.getResponse('create_game', secondPlayerData)

    sendMessageToCurrentUser(server, firstPlayerMessage, game.idPlayerOne)
    sendMessageToCurrentUser(server, secondPlayerMessage, game.idPlayerTwo)

    const room = this.rooms.find(({ roomId }) => roomId === roomIndex)
    this.rooms = this.rooms.filter((el) => el !== room)
    this.updateRoom(server)
  }

  public addShipLocation = (message: ShipReqData, ws: MyWebSocket, server: Server) => {
    const { gameId, ships, indexPlayer } = message
    const battleField = generateBattlefield(ships)

    const game = this.findGame(gameId)
    if (!game) return

    const playerOne = game.fields[game.idPlayerOne]
    const playerTwo = game.fields[game.idPlayerTwo]

    const { idPlayerOne, idPlayerTwo } = game

    if (idPlayerOne === indexPlayer) {
      playerTwo.matrixBattlefield = battleField
      playerTwo.frontBattlefield = ships
    }
    if (idPlayerTwo === indexPlayer) {
      playerOne.matrixBattlefield = battleField
      playerOne.frontBattlefield = ships
    }

    if (
      playerOne.matrixBattlefield.length > 0 &&
      playerTwo.matrixBattlefield.length > 0
    ) {
      this.startGame(game, server)
    }
  }

  public changeTurn(message: AttackDataReq, ws: MyWebSocket, server: Server) {
    const { gameId, indexPlayer, x, y } = message
    const game = this.findGame(gameId)
    if (!game) return

    const { idPlayerOne, idPlayerTwo, fields } = game

    const currentField = game.fields[indexPlayer]
    const { playerId: currentPlayer, matrixBattlefield } = currentField

    //const currentPlayer = indexPlayer === idPlayerOne ? idPlayerOne : idPlayerTwo

    if (currentPlayer !== game.turnIndex) return
    const hitRegister: HitRegister = createHitRegister(
      matrixBattlefield,
      { x, y },
      currentPlayer,
    )
    // const hitRegister: HitRegister =
    //   indexPlayer === idPlayerOne
    //     ? createHitRegister(fields.playerOne.matrixBattlefield, { x, y }, idPlayerOne)
    //     : createHitRegister(fields.playerTwo.matrixBattlefield, { x, y }, idPlayerTwo)
    const hitsArray = hitRegistration(hitRegister)
    if (!hitsArray) return

    if (hitsArray.length === 1 && hitsArray[0].status === 'miss') {
      const currentPlayer = indexPlayer === idPlayerOne ? idPlayerTwo : idPlayerOne
      game.turnIndex = currentPlayer
      this.sendAttackAndTurn(hitsArray[0], indexPlayer, server, currentPlayer)
    } else {
      const currentPlayer = indexPlayer === idPlayerOne ? idPlayerOne : idPlayerTwo
      hitsArray.forEach((el, id, arr) => {
        this.sendAttackAndTurn(el, indexPlayer, server, currentPlayer)
      })
      currentField.shoutedCount++
      if (currentField.shoutedCount === 20) {
        //
      }
    }
  }

  private getPlayerScore(indexPlayer: number, idPlayerOne: number, game: Game) {
    return indexPlayer === idPlayerOne
      ? game.fields.playerOne.shoutedCount
      : game.fields.playerTwo.shoutedCount
  }
  private addScoreToPlayer(indexPlayer: number, idPlayerOne: number, game: Game) {
    if (indexPlayer === idPlayerOne) game.fields.playerOne.shoutedCount++
    else game.fields.playerTwo.shoutedCount++
  }

  public sendAttackAndTurn = (
    data: AttackDataRes,
    playerIndex: number,
    server: Server,
    currentPlayer: number,
  ) => {
    this.sendAttack(data, playerIndex, server)
    this.sendTurnToPlayer(playerIndex, currentPlayer, server)
  }

  private sendAttack = (data: AttackDataRes, playerIndex: number, server: Server) => {
    const response = this.getResponse('attack', data)
    sendMessageToCurrentUser(server, response, playerIndex)
  }
  private sendTurnToPlayer = (
    playerIndex: number,
    currentPlayer: number,
    server: Server,
  ) => {
    const message: PlayerTernDataRes = { currentPlayer: currentPlayer }
    const response = this.getResponse('turn', message)
    sendMessageToCurrentUser(server, response, playerIndex)
    sendMessageToCurrentUser(server, response, currentPlayer)
  }

  private findGame = (gameId: number): Game | undefined => {
    return this.games.find(({ idGame }) => idGame === gameId)
  }

  private startGame = (game: Game, server: Server) => {
    const [firstData, secondData] = getStartGameData(game)
    const { idPlayerOne, idPlayerTwo } = game

    const firstPlayerResponse = this.getResponse('start_game', firstData)
    const secondPlayerResponse = this.getResponse('start_game', secondData)

    sendMessageToCurrentUser(server, firstPlayerResponse, idPlayerOne)
    sendMessageToCurrentUser(server, secondPlayerResponse, idPlayerTwo)

    this.sendTurnToPlayer(idPlayerOne, idPlayerOne, server)
    this.sendTurnToPlayer(idPlayerTwo, idPlayerOne, server)
  }

  private getResponse(type: MessageType, data: ResponseData) {
    const response = generateResponse(type, data)
    return stringifyWsMessage(response)
  }
}
