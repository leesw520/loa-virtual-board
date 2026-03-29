import type { BasicAnimalFace } from '../types/game'

/** 스프라이트: 종류 0~7은 각각 (A,C)→ac 시트, (B,D)→bd 시트에서 같은 그리드 인덱스 쌍 사용 */
export function basicAnimalSprite(
  speciesIndex: number,
  face: BasicAnimalFace,
): { asset: 'basic_animals_ac' | 'basic_animals_bd'; spriteIndex: number } {
  const base = speciesIndex * 2
  if (face === 'A') {
    return { asset: 'basic_animals_ac', spriteIndex: base }
  }
  if (face === 'C') {
    return { asset: 'basic_animals_ac', spriteIndex: base + 1 }
  }
  if (face === 'B') {
    return { asset: 'basic_animals_bd', spriteIndex: base }
  }
  return { asset: 'basic_animals_bd', spriteIndex: base + 1 }
}

const FACES: BasicAnimalFace[] = ['A', 'B', 'C', 'D']

export function rollBasicAnimalFaces(seed: number): BasicAnimalFace[] {
  let randomSeed = seed >>> 0
  const random = () => {
    randomSeed = (randomSeed * 1664525 + 1013904223) % 4294967296
    return randomSeed / 4294967296
  }
  return Array.from({ length: 8 }, () => FACES[Math.floor(random() * 4)]!)
}

export function normalizeBasicAnimalFaces(value: unknown): BasicAnimalFace[] {
  if (!Array.isArray(value) || value.length !== 8) {
    return ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A']
  }
  return value.map((x) =>
    x === 'A' || x === 'B' || x === 'C' || x === 'D' ? x : 'A',
  ) as BasicAnimalFace[]
}
