import { parseWsMessage } from '../utils/parseWsMessage.js'
import { WsServerHandler } from './ws-server-handler.js'
import { LoginReq } from '../models/player.js'
import { MyWebSocket } from '../models/ws.js'
import { generateUniNumb } from '../utils/generateUniNumb.js'
import { PlayerToRoomDataReq } from '../models/room.js'
import { WebSocketServer } from 'ws'
import { ShipReqData } from '../models/sheeps.js'
import { AttackDataReq, RandomAttackDataReq } from '../models/game.js'
import process from 'process'

const WS_PORT = process.env.WS_PORT || 3000
export const wsServer = new WebSocketServer({ port: +WS_PORT })

const handler = new WsServerHandler(wsServer)

export const wsServerController = (ws: MyWebSocket) => {
  ws.id = generateUniNumb(6)
  ws.on('message', (message) => {
    const parsedMessage = parseWsMessage(message)
    const { type, data } = parsedMessage

    if (type === 'reg') {
      handler.registerUser(parsedMessage as LoginReq, ws)
    } else if (type === 'create_room') {
      handler.createRoom(ws)
    } else if (type === 'add_user_to_room') {
      handler.createGame(data as PlayerToRoomDataReq, ws)
    } else if (type === 'add_ships') {
      handler.addShipLocation(data as ShipReqData)
    } else if (type === 'attack') {
      handler.changeTurn(data as AttackDataReq)
    } else if (type === 'randomAttack') {
      handler.randomAttack(data as RandomAttackDataReq, ws)
    }
  })
  ws.on('close', () => {
    handler.closeConnections(ws)
  })
}
