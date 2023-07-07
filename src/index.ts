import { WebSocketServer } from 'ws'
import { httpServer } from './http_server/index.js'
import { wsServerController } from './ws_server/ws-server-controller.js'
import * as process from 'process'

const WS_PORT = process.env.WS_PORT || 3000
const HTTP_PORT = process.env.HTTP_PORT || 8181

console.log(`Start static http server on the ${+HTTP_PORT} port!`)
httpServer.listen(HTTP_PORT)

export const wsServer = new WebSocketServer({ port: +WS_PORT })
wsServer.on('connection', wsServerController.bind(this, wsServer))
