import WebSocket from 'ws'
import { parseWsMessage } from '../utils/parseWsMessage.js'

export const wsServerController = (ws: WebSocket) => {
  ws.on('message', (message) => {
    const parsedMessage = parseWsMessage(message)
    console.log(parsedMessage)
  })
}
