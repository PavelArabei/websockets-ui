import WebSocket from 'ws'
import { WsMessageReq } from '../models/ws.js'

export const parseWsMessage = (message: WebSocket.RawData): WsMessageReq => {
  const messageObj = JSON.parse(message.toString())
  const data =
    messageObj.data === '' ? messageObj.data : JSON.parse(messageObj.data)

  return { ...messageObj, data }
}
