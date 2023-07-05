import WebSocket, { WebSocketServer } from 'ws'
import { httpServer } from './http_server/index.js'
import { WsMessageReq } from './models/ws.js'
import { parseWsMessage } from './utils/parseWsMessage.js'
import { wsServerController } from './ws_server/ws-server-controller.js'
const WS_Port = 3000
const HTTP_PORT = 8181

export const wsServer = new WebSocketServer({ port: WS_Port })
wsServer.on('connection', wsServerController)

console.log(`Start static http server on the ${HTTP_PORT} port!`)
httpServer.listen(HTTP_PORT)
