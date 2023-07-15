import WebSocket from 'ws'
import { MyWebSocket } from '../models/ws.js'

export const sendMessageToCurrentUser = (
  server: WebSocket.Server<typeof WebSocket>,
  message: string,
  id: number,
) => {
  server.clients.forEach((client) => {
    const newClient = client as MyWebSocket
    if (newClient.id === id) {
      newClient.send(message)
    }
  })
}
