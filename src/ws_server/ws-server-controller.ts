import { parseWsMessage } from '../utils/parseWsMessage.js'
import { WsServerHandler } from './ws-server-handler.js'
import { LoginReq } from '../models/player.js'
import { MyWebSocket } from '../models/ws.js'
import { generateUniNumb } from '../utils/generateUniNumb.js'
import { PlayerToRoomDataReq } from '../models/room.js'
import WebSocket from 'ws'
import { ShipReqData } from '../models/sheeps.js'
import { AttackDataReq } from '../models/game.js'

const handler = new WsServerHandler()

export const wsServerController = (
  server: WebSocket.Server<typeof WebSocket>,
  ws: MyWebSocket,
) => {
  ws.id = generateUniNumb(6)
  ws.on('message', (message) => {
    const parsedMessage = parseWsMessage(message)
    const { type, data } = parsedMessage

    if (type === 'reg') {
      handler.registerUser(parsedMessage as LoginReq, ws, server)
    } else if (type === 'create_room') {
      handler.createRoom(ws, server)
    } else if (type === 'add_user_to_room') {
      handler.createGame(data as PlayerToRoomDataReq, ws, server)
    } else if (type === 'add_ships') {
      handler.addShipLocation(data as ShipReqData, ws, server)
    } else if (type === 'attack') {
      handler.changeTurn(data as AttackDataReq, ws, server)
    }
  })
}
