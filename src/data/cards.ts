import type { PlayerColor } from '../types/game'

/** 기본 순서: 흰(내부키 red) → 노랑 → 초록 → 파랑 */
export const PLAYER_COLORS = ['red', 'yellow', 'green', 'blue'] as const

/** UI 테두리·버튼용 (red 키 = 흰색 토큰) */
export const PLAYER_COLOR_HEX: Record<PlayerColor, string> = {
  red: '#94a3b8',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
}

export const TRACK_IMAGES = ['track_1', 'track_2', 'track_3'] as const

export const TOKEN_VAULT_IMAGES = ['token_vault_1', 'token_vault_2'] as const

export const BASIC_ANIMAL_KEYS = Array.from({ length: 8 }, (_, index) => index)
export const SPECIAL_ANIMAL_KEYS = Array.from({ length: 8 }, (_, index) => index)

export const ENVIRONMENT_COUNT = 43
export const BUG_COUNT = 48

export const REFERENCE_IMAGES = {
  pointSheet: 'point_sheet',
  summaryAction: 'summary_actions',
  summaryBonus: 'summary_bonus',
}

export const CARD_BACK_IMAGES = {
  animals: 'animals_back',
  environments: 'environments_back',
  bugs: 'bugs_back',
}

export const BONUS_LABELS = {
  2: '보너스 1',
  3: '보너스 2',
} as const
