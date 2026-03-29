export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow'

export type Player = {
  id: string
  name: string
  color: PlayerColor
  specialAnimalId: number
  environments: number[]
}

export type ScoreTracks = Record<number, Record<string, number>>

export type DeckState = {
  deck: number[]
  market: number[]
  discard: number[]
}

export type PendingAction =
  | {
      type: 'scoreMove'
      trackIndex: 1 | 2 | 3
      playerId: string
      steps: number
      cost: number
    }
  | {
      type: 'environmentBuy'
      cardId: number
      playerId: string
    }
  | {
      type: 'bugUse'
      cardId: number
    }

export type GameState = {
  roomId: string
  players: Player[]
  scoreTracks: ScoreTracks
  environments: DeckState
  bugs: DeckState
  pendingAction: PendingAction | null
  canSelectMarket: boolean
  seed: number
  updatedAt: number
  updatedBy: string
}

export type HydratePayload = {
  state: GameState
}

export type PlayerSetup = {
  name: string
  color: PlayerColor
}

export type InitPayload = {
  roomId: string
  clientId: string
  players: PlayerSetup[]
}

export type ScoreMovePayload = {
  trackIndex: 1 | 2 | 3
  playerId: string
  steps: number
}

export type SelectEnvironmentPayload = {
  cardId: number
  playerId: string
}

export type SelectBugPayload = {
  cardId: number
}

export type GameAction =
  | { type: 'hydrate'; payload: HydratePayload }
  | { type: 'init'; payload: InitPayload }
  | { type: 'reset'; payload: { roomId: string; clientId: string } }
  | { type: 'setPendingScoreMove'; payload: ScoreMovePayload }
  | { type: 'setPendingEnvironmentBuy'; payload: SelectEnvironmentPayload }
  | { type: 'setPendingBugUse'; payload: SelectBugPayload }
  | { type: 'toggleMarketSelectable' }
  | { type: 'confirmPending'; clientId: string }
  | { type: 'cancelPending' }
