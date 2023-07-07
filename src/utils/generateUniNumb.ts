import * as crypto from 'crypto'

export const generateUniNumb = (length: number) => {
  return +new Array(length).fill(0).reduce((acc) => (acc += crypto.randomInt(0, 10)), '')
}
