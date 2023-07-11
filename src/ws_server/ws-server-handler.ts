import { LoginReq, RegDataRes, UpdateWinDataRes } from '../models/player.js'
import { MessageType, MyWebSocket, ResponseData, Server } from '../models/ws.js'
import { generateResponse } from '../utils/generateResponse.js'
import { stringifyWsMessage } from '../utils/stringifyWsMessage.js'
import { PlayerToRoomDataReq, Room } from '../models/room.js'
import { sendMessageToAllUsers } from '../utils/sendMessageToAllUsers.js'
import {
  AttackDataReq,
  AttackDataRes,
  Game,
  PlayerTernDataRes,
  RandomAttackDataReq,
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
import { getAvailableCoordinates, hitRegistration } from '../utils/hitRegistration.js'

export class WsServerHandler {
  private users: RegDataRes[] = []
  private rooms: Room[] = []
  private games: Game[] = []
  private winners: UpdateWinDataRes[] = []

  constructor(private server: Server) {}

  public registerUser = (message: LoginReq, ws: MyWebSocket) => {
    const { name, password } = message.data
    const user = getUser(name, password, ws.id, this.users)
    if (!user) return
    this.users.push(user)

    const response = this.getResponse(message.type, user)
    ws.send(response)
    this.updateRoom()
    this.sendWinners()
  }

  public createRoom = (ws: MyWebSocket) => {
    const existedRoom = this.rooms.find(({ roomId }) => ws.id === roomId)
    if (existedRoom) return

    const user = this.users.find(({ index }) => ws.id === index)
    if (!user) return

    const room: Room = createRoomObj(ws.id, user.name, user.index)
    this.rooms.push(room)

    this.updateRoom()
  }

  updateRoom = () => {
    const response = this.getResponse('update_room', this.rooms)
    sendMessageToAllUsers(this.server, response)
  }

  createGame = (message: PlayerToRoomDataReq, ws: MyWebSocket) => {
    const roomIndex = message.indexRoom
    if (roomIndex === ws.id) return

    const game = createGameObj(roomIndex, ws.id)
    this.games.push(game)

    const firstPlayerData = getFirstPlayerData(game.idGame, game.idPlayerOne)
    const secondPlayerData = getFirstPlayerData(game.idGame, game.idPlayerTwo)

    const firstPlayerMessage = this.getResponse('create_game', firstPlayerData)
    const secondPlayerMessage = this.getResponse('create_game', secondPlayerData)

    sendMessageToCurrentUser(this.server, firstPlayerMessage, game.idPlayerOne)
    sendMessageToCurrentUser(this.server, secondPlayerMessage, game.idPlayerTwo)

    const room = this.rooms.find(({ roomId }) => roomId === roomIndex)
    this.rooms = this.rooms.filter((el) => el !== room)
    this.updateRoom()
  }

  public addShipLocation = (message: ShipReqData, ws: MyWebSocket) => {
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
      this.startGame(game)
    }
  }

  public changeTurn(message: AttackDataReq, ws: MyWebSocket) {
    const { gameId, indexPlayer, x, y } = message
    const game = this.findGame(gameId)
    if (!game) return

    const { idPlayerOne, idPlayerTwo, turnIndex } = game
    const currentField = game.fields[indexPlayer]
    const { playerId: currentPlayer, matrixBattlefield } = currentField
    const secondPlayer = indexPlayer === idPlayerOne ? idPlayerTwo : idPlayerOne
    if (currentPlayer !== turnIndex) return

    const hitRegister = createHitRegister(matrixBattlefield, { x, y }, currentPlayer)

    const hitsArray = hitRegistration(hitRegister)
    if (!hitsArray) return

    if (hitsArray.length === 1 && hitsArray[0].status === 'miss') {
      game.turnIndex = secondPlayer
      this.sendAttackAndTurn(hitsArray[0], indexPlayer, secondPlayer)
    } else {
      const currentPlayer = indexPlayer === idPlayerOne ? idPlayerOne : idPlayerTwo
      hitsArray.forEach((el) => {
        this.sendAttackAndTurn(el, indexPlayer, currentPlayer)
      })

      currentField.shoutedCount++
      if (currentField.shoutedCount === 20) {
        this.finishGame(indexPlayer, secondPlayer, gameId)
      }
    }
  }

  public randomAttack({ gameId, indexPlayer }: RandomAttackDataReq, ws: MyWebSocket) {
    const game = this.findGame(gameId)
    if (!game) return

    const battlefield = game.fields[indexPlayer].matrixBattlefield
    const { x, y } = getAvailableCoordinates(battlefield)
    const attackData: AttackDataReq = { gameId, x, y, indexPlayer }

    this.changeTurn(attackData, ws)
  }

  private finishGame(winPlayer: number, idSecondPlayer: number, gameId: number) {
    const data = { winPlayer }
    const response = this.getResponse('finish', data)
    sendMessageToCurrentUser(this.server, response, winPlayer)
    sendMessageToCurrentUser(this.server, response, idSecondPlayer)

    this.updateWinners(winPlayer)
    this.deleteGame(gameId)
  }

  private deleteGame(gameId: number) {
    const index = this.games.findIndex((game) => game.idGame === gameId)
    if (index === -1) return
    this.games = this.games.filter((el, i) => i !== index)
  }

  private updateWinners(winPlayer: number) {
    const user = this.users.find((el) => (el.index = winPlayer))
    if (!user) return
    const name = user.name

    const winner = this.winners.find((player) => player.name === name)
    if (winner) winner.wins++
    else this.winners.push({ name, wins: 1 })

    this.sendWinners()
  }
  private sendWinners() {
    const winResponse = this.getResponse('update_winners', this.winners)
    sendMessageToAllUsers(this.server, winResponse)
  }

  public sendAttackAndTurn = (
    data: AttackDataRes,
    playerIndex: number,
    currentPlayer: number,
  ) => {
    this.sendAttack(data, playerIndex)
    this.sendTurnToPlayer(playerIndex, currentPlayer)
  }

  public closeConnections = (ws: MyWebSocket) => {
    const { id } = ws

    const room = this.rooms.find((room) => room.roomId === id)
    if (room) {
      this.rooms = this.rooms.filter((room) => room.roomId !== id)
      this.updateRoom()
    }

    const finish = (game: Game, id: number) => {
      const idSecondPlayer = game.idPlayerOne === id ? game.idPlayerTwo : game.idPlayerOne

      this.finishGame(idSecondPlayer, id, id)
      this.deleteGame(idSecondPlayer)
    }

    const gameOne = this.games.find((game) => game.idPlayerOne === id)
    const gameTwo = this.games.find((game) => game.idPlayerTwo === id)

    if (gameOne) finish(gameOne, id)
    if (gameTwo) finish(gameTwo, id)
  }

  private sendAttack = (data: AttackDataRes, playerIndex: number) => {
    const response = this.getResponse('attack', data)
    sendMessageToCurrentUser(this.server, response, playerIndex)
  }
  private sendTurnToPlayer = (playerIndex: number, currentPlayer: number) => {
    const message: PlayerTernDataRes = { currentPlayer: currentPlayer }
    const response = this.getResponse('turn', message)
    sendMessageToCurrentUser(this.server, response, playerIndex)
    sendMessageToCurrentUser(this.server, response, currentPlayer)
  }

  private findGame = (gameId: number): Game | undefined => {
    return this.games.find(({ idGame }) => idGame === gameId)
  }

  private startGame = (game: Game) => {
    const [firstData, secondData] = getStartGameData(game)
    const { idPlayerOne, idPlayerTwo } = game

    const firstPlayerResponse = this.getResponse('start_game', firstData)
    const secondPlayerResponse = this.getResponse('start_game', secondData)

    sendMessageToCurrentUser(this.server, firstPlayerResponse, idPlayerOne)
    sendMessageToCurrentUser(this.server, secondPlayerResponse, idPlayerTwo)

    this.sendTurnToPlayer(idPlayerOne, idPlayerOne)
    this.sendTurnToPlayer(idPlayerTwo, idPlayerOne)
  }

  private getResponse(type: MessageType, data: ResponseData) {
    const response = generateResponse(type, data)
    return stringifyWsMessage(response)
  }
}
