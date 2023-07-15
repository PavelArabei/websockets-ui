import WebSocket from 'ws'

export const sendMessageToAllUsers = (
  server: WebSocket.Server<typeof WebSocket>,
  message: string,
): void => {
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}
