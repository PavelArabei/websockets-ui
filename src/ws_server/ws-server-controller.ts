import { parseWsMessage } from '../utils/parseWsMessage.js'
import { WsServerHandler } from './ws-server-handler.js'
import { LoginReq } from '../models/player.js'
import { MyWebSocket } from '../models/ws.js'
import { generateUniNumb } from '../utils/generateUniNumb.js'
import { NewRoomReq, PlayerToRoomReq } from '../models/room.js'
import WebSocket from 'ws'

const handler = new WsServerHandler()

export const wsServerController = (
  server: WebSocket.Server<typeof WebSocket>,
  ws: MyWebSocket,
) => {
  ws.id = generateUniNumb(6)
  ws.on('message', (message) => {
    const parsedMessage = parseWsMessage(message)
    const { type } = parsedMessage
    if (type === 'reg') {
      handler.registerUser(parsedMessage as LoginReq, ws)
    } else if (type === 'create_room') {
      handler.createRoom(parsedMessage as NewRoomReq, ws, server)
    } else if (type === 'add_user_to_room') {
      handler.createGame(parsedMessage as PlayerToRoomReq, ws, server)
    }
  })
}
