export type SpriteRect = {
  x: number
  y: number
  width: number
  height: number
}

export function spriteRectByIndex(
  index: number,
  columns: number,
  rows: number,
): SpriteRect {
  const x = index % columns
  const y = Math.floor(index / columns)
  return {
    x,
    y,
    width: columns,
    height: rows,
  }
}

export function createShuffledDeck(size: number, seed = Date.now()): number[] {
  const values = Array.from({ length: size }, (_, index) => index)
  let randomSeed = seed

  const random = () => {
    randomSeed = (randomSeed * 1664525 + 1013904223) % 4294967296
    return randomSeed / 4294967296
  }

  for (let i = values.length - 1; i > 0; i -= 1) {
    const swapIndex = Math.floor(random() * (i + 1))
    ;[values[i], values[swapIndex]] = [values[swapIndex], values[i]]
  }

  return values
}
