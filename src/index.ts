import { httpServer } from './http_server/index.js'
import { wsServer, wsServerController } from './ws_server/ws-server-controller.js'
import * as process from 'process'

const HTTP_PORT = process.env.HTTP_PORT || 8181

console.log(`Start static http server on the ${+HTTP_PORT} port!`)
httpServer.listen(HTTP_PORT)

wsServer.on('connection', wsServerController)
wsServer.on('close', wsServerController)
