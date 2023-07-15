import { WsResponseToString } from '../models/ws.js'

export const stringifyWsMessage = (message: WsResponseToString): string => {
  return JSON.stringify({
    ...message,
    data: JSON.stringify(message.data),
  })
}
