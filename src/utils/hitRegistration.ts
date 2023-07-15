import { AttackDataRes, Battlefield, HitRegister, ShutStatus } from '../models/game.js'
import { Coordinates } from './crateObects.js'
import crypto from 'crypto'

const VHDirections = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]

const allDirections = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
]

export const createAttackObj = (
  x: number,
  y: number,
  currentPlayer: number,
  status: ShutStatus,
): AttackDataRes => {
  return {
    position: { x, y },
    currentPlayer,
    status,
  }
}

export const getShipCoordinates = (
  battleField: Battlefield,
  x: number,
  y: number,
  directions: number[][],
) => {
  let coordinates: number[][] = []
  coordinates.push([x, y])

  for (const [dx, dy] of directions) {
    const newRow = x + dx
    const newCol = y + dy
    if (isNotCrossField(newRow, newCol, battleField)) {
      if (battleField[newCol][newRow] === 3) {
        const newCoordinates = getShipCoordinates(battleField, newRow, newCol, [[dx, dy]])
        coordinates = [...coordinates, ...newCoordinates]
      }
    }
  }

  if (coordinates.length === 1) return coordinates
  if (coordinates[0][1] === coordinates[1][1])
    return coordinates.sort((a, b) => a[0] - b[0])
  if (coordinates[0][0] === coordinates[1][0])
    return coordinates.sort((a, b) => a[1] - b[1])

  return coordinates
}

export const isShipDestroyed = (
  battleField: Battlefield,
  x: number,
  y: number,
  directions: number[][],
): boolean => {
  for (const [dx, dy] of directions) {
    const newRow = x + dx
    const newCol = y + dy

    if (isNotCrossField(newRow, newCol, battleField)) {
      if (battleField[newCol][newRow] === 1) {
        return false
      }
      if (battleField[newCol][newRow] === 3) {
        const isTrue = isShipDestroyed(battleField, newRow, newCol, [[dx, dy]])
        if (!isTrue) return false
      }
    }
  }
  return true
}

export const clearAroundFields = (
  battleField: Battlefield,
  coordinates: number[][],
  currentPlayer: number,
): AttackDataRes[] => {
  const result: AttackDataRes[] = []

  if (coordinates.length === 1) {
    const [x, y] = coordinates[0]

    for (const [dx, dy] of allDirections) {
      const newRow = x + dx
      const newCol = y + dy
      if (isNotCrossField(newRow, newCol, battleField)) {
        const data: AttackDataRes = createAttackDataRes(newRow, newCol, currentPlayer)
        result.push(data)
      }
    }
  }

  if (coordinates.length > 1 && coordinates[0][1] === coordinates[1][1]) {
    //  horizontal ship
    const horizontalDirectionsStart = [
      [0, 1],
      [0, -1],
      [-1, 0],
      [-1, 1],
      [-1, -1],
    ]
    const horizontalDirections = [
      [0, 1],
      [0, -1],
    ]
    const horizontalDirectionsEnd = [
      [0, 1],
      [0, -1],
      [1, 0],
      [1, 1],
      [1, -1],
    ]

    coordinates.forEach((el, i, array) => {
      if (i === 0) {
        getCoordinates(
          coordinates,
          i,
          horizontalDirectionsStart,
          battleField,
          currentPlayer,
          result,
        )
      } else if (i === array.length - 1) {
        getCoordinates(
          coordinates,
          i,
          horizontalDirectionsEnd,
          battleField,
          currentPlayer,
          result,
        )
      } else {
        getCoordinates(
          coordinates,
          i,
          horizontalDirections,
          battleField,
          currentPlayer,
          result,
        )
      }
    })
  }

  if (coordinates.length > 1 && coordinates[0][0] === coordinates[1][0]) {
    //  vertical
    const verticalDirectionsStart = [
      [1, 0],
      [-1, 0],
      [0, -1],
      [-1, -1],
      [1, -1],
    ]
    const verticalDirections = [
      [1, 0],
      [-1, 0],
    ]
    const verticalDirectionsEnd = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [-1, 1],
      [1, 1],
    ]

    coordinates.forEach((el, i, array) => {
      if (i === 0) {
        getCoordinates(
          coordinates,
          i,
          verticalDirectionsStart,
          battleField,
          currentPlayer,
          result,
        )
      } else if (i === array.length - 1) {
        getCoordinates(
          coordinates,
          i,
          verticalDirectionsEnd,
          battleField,
          currentPlayer,
          result,
        )
      } else {
        getCoordinates(
          coordinates,
          i,
          verticalDirections,
          battleField,
          currentPlayer,
          result,
        )
      }
    })
  }
  return result
}

export const hitRegistration = (
  hitRegister: HitRegister,
): undefined | AttackDataRes[] => {
  const { battlefield, x, y, currentPlayer } = hitRegister
  const target = battlefield[y][x]
  const result: AttackDataRes[] = []
  if (target === 0) {
    const attackData = createAttackObj(x, y, currentPlayer, 'miss')
    result.push(attackData)
    battlefield[y][x] = 2
  } else if (target === 1) {
    const isKill = isShipDestroyed(battlefield, x, y, VHDirections)
    if (isKill) {
      const killedField = createAttackObj(x, y, currentPlayer, 'killed')
      result.push(killedField)
      const shipCoordinates = getShipCoordinates(battlefield, x, y, VHDirections)
      const clearedFields = clearAroundFields(battlefield, shipCoordinates, currentPlayer)
      clearedFields.forEach((el) => {
        const { y, x } = el.position
        battlefield[y][x] = 2
        result.push(el)
      })
    } else {
      const attackData = createAttackObj(x, y, currentPlayer, 'shot')
      result.push(attackData)
    }

    battlefield[y][x] = 3
  } else return

  return result
}

export const isNotCrossField = (x: number, y: number, battleField: Battlefield) =>
  x >= 0 && x < battleField.length && y >= 0 && y < battleField[0].length

export const createAttackDataRes = (
  x: number,
  y: number,
  currentPlayer: number,
): AttackDataRes => {
  return {
    position: { x, y },
    currentPlayer: currentPlayer,
    status: 'miss',
  }
}

export const getCoordinates = (
  coordinates: number[][],
  i: number,
  coordinatesToWatch: number[][],
  battleField: Battlefield,
  currentPlayer: number,
  result: AttackDataRes[],
) => {
  const [x, y] = coordinates[i]

  for (const [dx, dy] of coordinatesToWatch) {
    const newRow = x + dx
    const newCol = y + dy
    if (isNotCrossField(newRow, newCol, battleField)) {
      const data: AttackDataRes = createAttackDataRes(newRow, newCol, currentPlayer)
      result.push(data)
    }
  }
}

export const randomInit = (): number => crypto.randomInt(0, 10)

export const getAvailableCoordinates = (battleField: Battlefield): Coordinates => {
  let coordinates: Coordinates
  const y = randomInit()
  const x = randomInit()
  const coordinatesValue = battleField[y][x]

  if (coordinatesValue === 0 || coordinatesValue === 1) {
    coordinates = { x, y }
  } else {
    coordinates = getAvailableCoordinates(battleField)
  }

  return coordinates
}
