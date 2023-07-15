import { Ship } from '../models/sheeps.js'
import { Battlefield } from '../models/game.js'

export const generateBattlefield = (coordinates: Ship[]): Battlefield => {
  const battlefield: Battlefield = []

  for (let i = 0; i < 10; i++) {
    const row: number[] = Array(10).fill(0)
    battlefield.push(row)
  }

  coordinates.forEach((ship) => {
    const { x, y } = ship.position
    const { direction, length } = ship
    const dx = direction ? 0 : 1
    const dy = direction ? 1 : 0

    for (let i = 0; i < length; i++) {
      const newRow = y + dy * i
      const newCol = x + dx * i

      if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
        battlefield[newRow][newCol] = 1
      }
    }
  })

  return battlefield
}
