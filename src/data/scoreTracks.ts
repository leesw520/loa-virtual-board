/** 별(시작) 다음 1번째 칸부터의 비용. 트랙2·3는 동일 규칙(잎 vs 물만 다름). */
function cellCostTrack1(cell: number): number {
  if (cell < 1 || cell > 9) {
    return 0
  }
  if (cell === 1) {
    return 1
  }
  if (cell <= 3) {
    return 2
  }
  if (cell <= 5) {
    return 3
  }
  if (cell === 6) {
    return 4
  }
  if (cell === 7) {
    return 5
  }
  if (cell === 8) {
    return 6
  }
  return 7
}

function cellCostTrack2Or3(cell: number): number {
  if (cell < 1 || cell > 10) {
    return 0
  }
  if (cell === 1) {
    return 1
  }
  if (cell <= 3) {
    return 2
  }
  if (cell <= 6) {
    return 3
  }
  if (cell <= 8) {
    return 4
  }
  if (cell === 9) {
    return 5
  }
  return 6
}

export const SCORE_TRACK_MAX_POSITION: Record<1 | 2 | 3, number> = {
  1: 9,
  2: 10,
  3: 10,
}

/** 현재 칸(별=0)에서 steps칸 앞으로 갈 때 드는 잎사귀 또는 물의 총량 */
export function scoreAdvanceCost(
  trackIndex: 1 | 2 | 3,
  currentPosition: number,
  steps: number,
): number {
  let sum = 0
  const maxCell = SCORE_TRACK_MAX_POSITION[trackIndex]
  for (let i = 1; i <= steps; i++) {
    const cell = currentPosition + i
    if (cell > maxCell) {
      break
    }
    sum +=
      trackIndex === 1 ? cellCostTrack1(cell) : cellCostTrack2Or3(cell)
  }
  return sum
}

export function scoreResourceLabel(trackIndex: 1 | 2 | 3): '잎사귀' | '물' {
  return trackIndex === 3 ? '물' : '잎사귀'
}

/**
 * 상단 진행 칸 중심의 이미지 가로 위치(%). 캘리브레이션 오버레이(십자) 기준 수동 배열.
 * 인덱스 = position (0=별, 1…=전진 칸).
 */
/** 사용자 캘리브(반올림). 인덱스 = position (0=별). */
export const TRACK_SLOT_LEFT_PCT: Record<1 | 2 | 3, readonly number[]> = {
  1: [11, 20, 28, 36, 45, 53, 61, 70, 78, 86],
  2: [9, 16, 23, 30, 37, 44, 51, 58, 65, 72, 80],
  3: [6, 13, 20, 27, 34, 40, 47, 55, 62, 69, 75],
}

/** 토큰이 놓이는 세로(상단 물/칸 행 기준, 이미지 높이 %) */
export const TRACK_TOKEN_GEOMETRY: Record<1 | 2 | 3, { topPct: number }> = {
  1: { topPct: 43.5 },
  2: { topPct: 39 },
  3: { topPct: 37 },
}

/**
 * 2×2 토큰 가로 펼침에 쓸 ‘기준 칸’. 실제 게임 토큰은 항상 이 값으로 간격을 잡음.
 * (clusterCalib UI의 기준 칸은 뭉치 미리보기용 — 게임과 다르면 여기를 바꿉니다.)
 */
export const TRACK_SPREAD_REF_SLOT: Record<1 | 2 | 3, number> = {
  1: 5,
  2: 5,
  3: 5,
}

function clampedSpreadRef(trackIndex: 1 | 2 | 3): number {
  const max = SCORE_TRACK_MAX_POSITION[trackIndex]
  const r = TRACK_SPREAD_REF_SLOT[trackIndex]
  return Math.max(0, Math.min(r, max))
}

function trackSlotLeftPct(trackIndex: 1 | 2 | 3, position: number): number {
  const slots = TRACK_SLOT_LEFT_PCT[trackIndex]
  const max = SCORE_TRACK_MAX_POSITION[trackIndex]
  const clamped = Math.max(0, Math.min(position, max))
  return slots[clamped] ?? slots[0]
}

/** 인접 칸 간격(평균) — 2×2 토큰 가로 펼침 폭에 사용 */
export function trackSlotStepForSpread(trackIndex: 1 | 2 | 3, position: number): number {
  const max = SCORE_TRACK_MAX_POSITION[trackIndex]
  const left = trackSlotLeftPct(trackIndex, position)
  if (position <= 0) {
    return trackSlotLeftPct(trackIndex, 1) - left
  }
  if (position >= max) {
    return left - trackSlotLeftPct(trackIndex, max - 1)
  }
  return (
    (trackSlotLeftPct(trackIndex, position + 1) -
      trackSlotLeftPct(trackIndex, position - 1)) /
    2
  )
}

/** 같은 칸에 4명일 때 겹침 방지: 가로는 칸 폭 비례, 세로는 % */
const SLOT_GRID: ReadonlyArray<readonly [number, number]> = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
]

const SPREAD_X_MULT = 0.22
const SPREAD_Y_PCT = 5.0

/** 클러스터 중심이 주어졌을 때 각 슬롯 좌표(실제 토큰·캘리브 뭉치 공통) */
export function tokenOffsetsFromClusterCenter(
  trackIndex: 1 | 2 | 3,
  refPosition: number,
  center: { leftPct: number; topPct: number },
  playerSlot: number,
) {
  const stepW = trackSlotStepForSpread(trackIndex, refPosition)
  const [gx, gy] = SLOT_GRID[playerSlot % SLOT_GRID.length] ?? SLOT_GRID[0]
  return {
    leftPct: center.leftPct + gx * stepW * SPREAD_X_MULT,
    topPct: center.topPct + gy * SPREAD_Y_PCT,
  }
}

/** 칸 중심(플레이어 오프셋 없음). 캘리브레이션 더미·배치 기준 */
export function trackCellCenter(trackIndex: 1 | 2 | 3, position: number) {
  const g = TRACK_TOKEN_GEOMETRY[trackIndex]
  const clamped = Math.max(0, Math.min(position, SCORE_TRACK_MAX_POSITION[trackIndex]))
  return { leftPct: trackSlotLeftPct(trackIndex, clamped), topPct: g.topPct }
}

export function tokenPositionPercent(
  trackIndex: 1 | 2 | 3,
  position: number,
  playerSlot: number,
) {
  const { leftPct: leftBase, topPct: topBase } = trackCellCenter(trackIndex, position)
  const stepW = trackSlotStepForSpread(trackIndex, clampedSpreadRef(trackIndex))

  const [gx, gy] = SLOT_GRID[playerSlot % SLOT_GRID.length] ?? SLOT_GRID[0]
  const spreadX = stepW * SPREAD_X_MULT
  const spreadY = SPREAD_Y_PCT
  const leftPct = leftBase + gx * spreadX
  const topPct = topBase + gy * spreadY

  return { leftPct, topPct }
}
