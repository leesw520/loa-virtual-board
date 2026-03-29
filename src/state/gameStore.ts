import { BUG_COUNT, ENVIRONMENT_COUNT } from '../data/cards'
import {
  SCORE_TRACK_MAX_POSITION,
  scoreAdvanceCost,
} from '../data/scoreTracks'
import type {
  DeckState,
  GameAction,
  GameState,
  PendingAction,
  Player,
  PlayerSetup,
} from '../types/game'
import { createShuffledDeck } from '../utils/sprite'

function drawFromDeck(deckState: DeckState, amount: number): DeckState {
  const nextDeck = [...deckState.deck]
  const nextMarket = [...deckState.market]
  const nextDiscard = [...deckState.discard]

  while (nextMarket.length < amount && nextDeck.length > 0) {
    const value = nextDeck.shift()
    if (value === undefined) {
      break
    }
    nextMarket.push(value)
  }

  return { deck: nextDeck, market: nextMarket, discard: nextDiscard }
}

function makePlayers(config: PlayerSetup[], specialDeck: number[]): Player[] {
  return config.map((entry, index) => ({
    id: `p${index + 1}`,
    name: entry.name.trim() || `Player ${index + 1}`,
    color: entry.color,
    specialAnimalId: specialDeck[index] ?? index,
    environments: [],
  }))
}

export const emptyGameState: GameState = {
  roomId: '',
  players: [],
  scoreTracks: {
    1: {},
    2: {},
    3: {},
  },
  environments: { deck: [], market: [], discard: [] },
  bugs: { deck: [], market: [], discard: [] },
  pendingAction: null,
  canSelectMarket: false,
  seed: 0,
  updatedAt: 0,
  updatedBy: '',
}

function consumeMarketCard(deckState: DeckState, cardId: number): DeckState {
  return {
    deck: [...deckState.deck],
    market: deckState.market.filter((id) => id !== cardId),
    discard: [...deckState.discard, cardId],
  }
}

function withMeta(state: GameState, clientId: string): GameState {
  return {
    ...state,
    updatedBy: clientId,
    updatedAt: Date.now(),
  }
}

function applyPendingAction(state: GameState, action: PendingAction): GameState {
  if (action.type === 'scoreMove') {
    const current = state.scoreTracks[action.trackIndex][action.playerId] ?? 0
    const cap = SCORE_TRACK_MAX_POSITION[action.trackIndex]
    const next = Math.min(cap, current + action.steps)

    return {
      ...state,
      scoreTracks: {
        ...state.scoreTracks,
        [action.trackIndex]: {
          ...state.scoreTracks[action.trackIndex],
          [action.playerId]: next,
        },
      },
      pendingAction: null,
      canSelectMarket: false,
    }
  }

  if (action.type === 'environmentBuy') {
    const updatedPlayers = state.players.map((player) =>
      player.id === action.playerId
        ? { ...player, environments: [...player.environments, action.cardId] }
        : player,
    )
    const consumed = consumeMarketCard(state.environments, action.cardId)
    const refilled = drawFromDeck(consumed, 3)

    return {
      ...state,
      players: updatedPlayers,
      environments: refilled,
      pendingAction: null,
      canSelectMarket: false,
    }
  }

  const consumed = consumeMarketCard(state.bugs, action.cardId)
  const refilled = drawFromDeck(consumed, 3)

  return {
    ...state,
    bugs: refilled,
    pendingAction: null,
    canSelectMarket: false,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'hydrate':
      return action.payload.state
    case 'reset':
      return {
        ...emptyGameState,
        roomId: action.payload.roomId,
        updatedAt: Date.now(),
        updatedBy: action.payload.clientId,
      }
    case 'init': {
      const seed = Date.now()
      const environmentDeck = createShuffledDeck(ENVIRONMENT_COUNT, seed + 101)
      const bugDeck = createShuffledDeck(BUG_COUNT, seed + 202)
      const specialDeck = createShuffledDeck(8, seed + 303)
      const players = makePlayers(action.payload.players, specialDeck)

      const base: GameState = {
        roomId: action.payload.roomId,
        players,
        scoreTracks: {
          1: Object.fromEntries(players.map((p) => [p.id, 0])),
          2: Object.fromEntries(players.map((p) => [p.id, 0])),
          3: Object.fromEntries(players.map((p) => [p.id, 0])),
        },
        environments: drawFromDeck(
          { deck: environmentDeck, market: [], discard: [] },
          3,
        ),
        bugs: drawFromDeck({ deck: bugDeck, market: [], discard: [] }, 3),
        pendingAction: null,
        canSelectMarket: false,
        seed,
        updatedAt: Date.now(),
        updatedBy: action.payload.clientId,
      }

      return base
    }
    case 'setPendingScoreMove': {
      const { trackIndex, playerId, steps } = action.payload
      const current = state.scoreTracks[trackIndex][playerId] ?? 0
      return {
        ...state,
        pendingAction: {
          type: 'scoreMove',
          trackIndex,
          playerId,
          steps,
          cost: scoreAdvanceCost(trackIndex, current, steps),
        },
      }
    }
    case 'setPendingEnvironmentBuy':
      return {
        ...state,
        pendingAction: { type: 'environmentBuy', ...action.payload },
      }
    case 'setPendingBugUse':
      return {
        ...state,
        pendingAction: { type: 'bugUse', ...action.payload },
      }
    case 'toggleMarketSelectable':
      return { ...state, canSelectMarket: !state.canSelectMarket, pendingAction: null }
    case 'confirmPending':
      if (!state.pendingAction) {
        return state
      }
      return withMeta(applyPendingAction(state, state.pendingAction), action.clientId)
    case 'cancelPending':
      return { ...state, pendingAction: null }
    default:
      return state
  }
}
