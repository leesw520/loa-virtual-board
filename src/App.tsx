import { useEffect, useMemo, useReducer, useState } from 'react'
import './App.css'
import { AnimalBoard } from './components/cards/AnimalBoard'
import { EnvironmentBugBoard } from './components/cards/EnvironmentBugBoard'
import { IntroScreen } from './components/intro/IntroScreen'
import { ViewerWaitingScreen } from './components/intro/ViewerWaitingScreen'
import { PlayerTopBar } from './components/layout/PlayerTopBar'
import {
  ModalViewer,
  ScoreMoveDialog,
} from './components/overlay/ModalViewer'
import { ReferenceOverlays } from './components/overlay/ReferenceOverlays'
import { ScoreTracksPanel } from './components/score/ScoreTracksPanel'
import { basicAnimalSprite } from './data/basicAnimalFaces'
import { CARD_BACK_IMAGES, REFERENCE_IMAGES, TOKEN_VAULT_IMAGES } from './data/cards'
import {
  SCORE_TRACK_MAX_POSITION,
  scoreAdvanceCost,
  scoreResourceLabel,
} from './data/scoreTracks'
import { firestore, isFirebaseConfigured } from './lib/firebase'
import { pushGameState, subscribeGameState } from './lib/realtimeGame'
import { emptyGameState, gameReducer } from './state/gameStore'
import type { PlayerSetup } from './types/game'
import { imagePath } from './utils/assets'
import { isViewerMode } from './utils/roomRole'

function App() {
  const queryRoom =
    new URLSearchParams(window.location.search).get('room')?.trim() || 'default-room'
  const clientId = useMemo(() => crypto.randomUUID(), [])
  const isViewer = useMemo(() => isViewerMode(), [])

  const [state, dispatch] = useReducer(gameReducer, emptyGameState)
  const [collapsedTopBar, setCollapsedTopBar] = useState(false)
  const [modal, setModal] = useState<
    | null
    | { type: 'basic'; id: number }
    | { type: 'special'; id: number }
    | { type: 'environment'; id: number }
    | { type: 'bug'; id: number }
    | { type: 'bonus'; track: 2 | 3 }
    | { type: 'pointSheet' }
    | { type: 'summary' }
  >(null)
  const [scoreDialog, setScoreDialog] = useState<{
    open: boolean
    trackIndex: 1 | 2 | 3
    playerId: string
    steps: number
  }>({
    open: false,
    trackIndex: 1,
    playerId: 'p1',
    steps: 1,
  })
  const [selectedBuyer, setSelectedBuyer] = useState('p1')
  const [scoreUndo, setScoreUndo] = useState<Record<1 | 2 | 3, Array<{ playerId: string; prev: number }>>>({
    1: [],
    2: [],
    3: [],
  })
  const [environmentUndo, setEnvironmentUndo] = useState<
    Array<{
      playerId: string
      prevEnvironments: number[]
      prevDeck: number[]
      prevMarket: number[]
      prevDiscard: number[]
    }>
  >([])
  const [bugUndo, setBugUndo] = useState<
    Array<{
      prevDeck: number[]
      prevMarket: number[]
      prevDiscard: number[]
    }>
  >([])

  const handleIntroStart = (payload: {
    players: PlayerSetup[]
    randomBasicAnimalFaces: boolean
  }) => {
    setScoreUndo({ 1: [], 2: [], 3: [] })
    setEnvironmentUndo([])
    setBugUndo([])
    setSelectedBuyer('p1')
    dispatch({
      type: 'init',
      payload: {
        roomId: queryRoom,
        clientId,
        players: payload.players,
        randomBasicAnimalFaces: payload.randomBasicAnimalFaces,
      },
    })
  }

  const handleResetToIntro = () => {
    setModal(null)
    setScoreDialog((prev) => ({ ...prev, open: false }))
    setScoreUndo({ 1: [], 2: [], 3: [] })
    setEnvironmentUndo([])
    setBugUndo([])
    setSelectedBuyer('p1')
    setCollapsedTopBar(false)
    dispatch({ type: 'reset', payload: { roomId: queryRoom, clientId } })
  }

  useEffect(() => {
    if (!firestore || !isFirebaseConfigured()) {
      return
    }
    const unsubscribe = subscribeGameState(firestore, queryRoom, (nextState) => {
      dispatch({ type: 'hydrate', payload: { state: nextState } })
    })
    return () => unsubscribe()
  }, [queryRoom])

  useEffect(() => {
    if (!firestore || !isFirebaseConfigured() || !state.roomId || isViewer) {
      return
    }
    pushGameState(firestore, queryRoom, state).catch(() => {})
  }, [queryRoom, state, isViewer])

  const buyerId = state.players.some((player) => player.id === selectedBuyer)
    ? selectedBuyer
    : state.players[0]?.id ?? 'p1'

  const scoreCurrentPos =
    state.scoreTracks[scoreDialog.trackIndex][scoreDialog.playerId] ?? 0
  const scoreMaxSteps = Math.max(
    0,
    SCORE_TRACK_MAX_POSITION[scoreDialog.trackIndex] - scoreCurrentPos,
  )

  useEffect(() => {
    if (!scoreDialog.open) {
      return
    }
    setScoreDialog((prev) => {
      const cur = state.scoreTracks[prev.trackIndex][prev.playerId] ?? 0
      const max = SCORE_TRACK_MAX_POSITION[prev.trackIndex] - cur
      if (max <= 0 && prev.steps !== 0) {
        return { ...prev, steps: 0 }
      }
      if (max > 0 && prev.steps > max) {
        return { ...prev, steps: max }
      }
      if (max > 0 && prev.steps < 1) {
        return { ...prev, steps: 1 }
      }
      return prev
    })
  }, [
    scoreDialog.open,
    scoreDialog.trackIndex,
    scoreDialog.playerId,
    state.scoreTracks,
  ])

  const scoreCostAmount =
    scoreMaxSteps > 0
      ? scoreAdvanceCost(scoreDialog.trackIndex, scoreCurrentPos, scoreDialog.steps)
      : 0
  const scoreCostLabel =
    scoreMaxSteps > 0
      ? `${scoreResourceLabel(scoreDialog.trackIndex)} ${scoreCostAmount}`
      : ''

  const activeModal = (() => {
    if (!modal) {
      return null
    }
    if (modal.type === 'basic') {
      const face = state.basicAnimalFaces[modal.id] ?? 'A'
      const { asset, spriteIndex } = basicAnimalSprite(modal.id, face)
      return {
        title: `기본 동물 ${modal.id + 1} (${face}면)`,
        frontSrc: imagePath(asset),
        frontIndex: spriteIndex,
        frontColumns: 4,
        frontRows: 4,
        backSrc: undefined,
      }
    }
    if (modal.type === 'special') {
      return {
        title: `특수 동물 ${modal.id + 1}`,
        frontSrc: imagePath('special_animals'),
        frontIndex: modal.id,
        frontColumns: 3,
        frontRows: 3,
        backSrc: imagePath(CARD_BACK_IMAGES.animals),
      }
    }
    if (modal.type === 'environment') {
      return {
        title: `지형 카드 ${modal.id + 1}`,
        frontSrc: imagePath('environments'),
        frontIndex: modal.id,
        frontColumns: 10,
        frontRows: 5,
        backSrc: imagePath(CARD_BACK_IMAGES.environments),
      }
    }
    if (modal.type === 'bug') {
      return {
        title: `곤충 카드 ${modal.id + 1}`,
        frontSrc: imagePath('bugs'),
        frontIndex: modal.id,
        frontColumns: 10,
        frontRows: 5,
        backSrc: imagePath(CARD_BACK_IMAGES.bugs),
      }
    }
    if (modal.type === 'bonus') {
      return {
        title: `보너스 ${modal.track - 1}`,
        frontSrc: imagePath(`track_${modal.track}`),
      }
    }
    if (modal.type === 'pointSheet') {
      return {
        title: '점수표',
        frontSrc: imagePath('point_sheet'),
      }
    }
    if (modal.type === 'summary') {
      return {
        title: '행동/보너스 참조표',
        frontSrc: imagePath(REFERENCE_IMAGES.summaryAction),
        backSrc: imagePath('summary_bonus'),
      }
    }
    return null
  })()

  const undoScoreTrack = (trackIndex: 1 | 2 | 3) => {
    const last = scoreUndo[trackIndex][scoreUndo[trackIndex].length - 1]
    if (!last) {
      return
    }
    const nextState = {
      ...state,
      scoreTracks: {
        ...state.scoreTracks,
        [trackIndex]: {
          ...state.scoreTracks[trackIndex],
          [last.playerId]: last.prev,
        },
      },
      updatedAt: Date.now(),
      updatedBy: clientId,
    }
    setScoreUndo((prev) => ({
      ...prev,
      [trackIndex]: prev[trackIndex].slice(0, -1),
    }))
    dispatch({ type: 'hydrate', payload: { state: nextState } })
  }

  const undoEnvironmentUse = () => {
    const last = environmentUndo[environmentUndo.length - 1]
    if (!last) {
      return
    }
    const nextState = {
      ...state,
      players: state.players.map((player) =>
        player.id === last.playerId ? { ...player, environments: [...last.prevEnvironments] } : player,
      ),
      environments: {
        deck: [...last.prevDeck],
        market: [...last.prevMarket],
        discard: [...last.prevDiscard],
      },
      updatedAt: Date.now(),
      updatedBy: clientId,
    }
    setEnvironmentUndo((prev) => prev.slice(0, -1))
    dispatch({ type: 'hydrate', payload: { state: nextState } })
  }

  const undoBugUse = () => {
    const last = bugUndo[bugUndo.length - 1]
    if (!last) {
      return
    }
    const nextState = {
      ...state,
      bugs: {
        deck: [...last.prevDeck],
        market: [...last.prevMarket],
        discard: [...last.prevDiscard],
      },
      updatedAt: Date.now(),
      updatedBy: clientId,
    }
    setBugUndo((prev) => prev.slice(0, -1))
    dispatch({ type: 'hydrate', payload: { state: nextState } })
  }

  if (state.players.length === 0) {
    return (
      <div className="app-shell">
        {isViewer ? (
          <ViewerWaitingScreen roomId={queryRoom} />
        ) : (
          <IntroScreen onStart={handleIntroStart} />
        )}
      </div>
    )
  }

  return (
    <div className="app-shell">
      <PlayerTopBar
        collapsed={collapsedTopBar}
        players={state.players}
        readOnly={isViewer}
        onToggle={() => setCollapsedTopBar((value) => !value)}
        onReset={handleResetToIntro}
        onOpenSpecialAnimal={(id) => setModal({ type: 'special', id })}
        onOpenEnvironment={(id) => setModal({ type: 'environment', id })}
      />
      <main className="main-scroll">
        <ScoreTracksPanel
          state={state}
          readOnly={isViewer}
          onOpenMoveDialog={(track) => {
            if (isViewer) {
              return
            }
            const pid = state.players[0]?.id ?? 'p1'
            const cur = state.scoreTracks[track][pid] ?? 0
            const max = SCORE_TRACK_MAX_POSITION[track] - cur
            setScoreDialog({
              open: true,
              trackIndex: track,
              playerId: pid,
              steps: max <= 0 ? 0 : 1,
            })
          }}
          onOpenBonus={(track) => setModal({ type: 'bonus', track })}
        />

        <section className="panel">
          <h2>점수 트랙 요약</h2>
          <div className="track-status-grid">
            {state.players.map((player) => (
              <div key={`status-${player.id}`} className="track-status-card">
                <strong>{player.name}</strong>
                <span>트랙1: {state.scoreTracks[1][player.id] ?? 0}</span>
                <span>트랙2: {state.scoreTracks[2][player.id] ?? 0}</span>
                <span>트랙3: {state.scoreTracks[3][player.id] ?? 0}</span>
              </div>
            ))}
          </div>
          {!isViewer ? (
            <div className="undo-row">
              <button type="button" onClick={() => undoScoreTrack(1)} disabled={scoreUndo[1].length === 0}>
                트랙1 전진 취소
              </button>
              <button type="button" onClick={() => undoScoreTrack(2)} disabled={scoreUndo[2].length === 0}>
                트랙2 전진 취소
              </button>
              <button type="button" onClick={() => undoScoreTrack(3)} disabled={scoreUndo[3].length === 0}>
                트랙3 전진 취소
              </button>
            </div>
          ) : null}
        </section>

        <section className="panel">
          <h2>토큰 보관소</h2>
          <div className="vault-grid">
            {TOKEN_VAULT_IMAGES.map((asset) => (
              <img key={asset} src={imagePath(asset)} alt={asset} />
            ))}
          </div>
        </section>

        <AnimalBoard
          basicAnimalFaces={state.basicAnimalFaces}
          onOpenBasic={(id) => setModal({ type: 'basic', id })}
        />

        <EnvironmentBugBoard
          state={state}
          readOnly={isViewer}
          onRefreshToggle={() => dispatch({ type: 'toggleMarketSelectable' })}
          onOpenEnvironment={(id) => setModal({ type: 'environment', id })}
          onOpenBug={(id) => setModal({ type: 'bug', id })}
        />
        {!isViewer ? (
          <div className="undo-row">
            <button type="button" onClick={undoEnvironmentUse} disabled={environmentUndo.length === 0}>
              지형 카드 사용 취소
            </button>
            <button type="button" onClick={undoBugUse} disabled={bugUndo.length === 0}>
              곤충 카드 사용 취소
            </button>
          </div>
        ) : null}
      </main>

      <ReferenceOverlays
        onOpenPointSheet={() => setModal({ type: 'pointSheet' })}
        onOpenSummary={() => setModal({ type: 'summary' })}
      />

      <ScoreMoveDialog
        open={scoreDialog.open}
        trackIndex={scoreDialog.trackIndex}
        playerId={scoreDialog.playerId}
        players={state.players}
        steps={scoreDialog.steps}
        costLabel={scoreCostLabel}
        maxSteps={scoreMaxSteps}
        onSelectPlayer={(id) => setScoreDialog((prev) => ({ ...prev, playerId: id }))}
        onChangeStep={(step) => setScoreDialog((prev) => ({ ...prev, steps: step }))}
        onConfirm={() => {
          if (isViewer) {
            return
          }
          const prev = state.scoreTracks[scoreDialog.trackIndex][scoreDialog.playerId] ?? 0
          setScoreUndo((current) => ({
            ...current,
            [scoreDialog.trackIndex]: [
              ...current[scoreDialog.trackIndex],
              { playerId: scoreDialog.playerId, prev },
            ],
          }))
          dispatch({
            type: 'setPendingScoreMove',
            payload: {
              trackIndex: scoreDialog.trackIndex,
              playerId: scoreDialog.playerId,
              steps: scoreDialog.steps,
            },
          })
          dispatch({ type: 'confirmPending', clientId })
          setScoreDialog((prev) => ({ ...prev, open: false }))
        }}
        onCancel={() => setScoreDialog((prev) => ({ ...prev, open: false }))}
      />

      <ModalViewer
        open={Boolean(activeModal)}
        title={activeModal?.title ?? ''}
        frontSrc={activeModal?.frontSrc ?? ''}
        frontAlt={activeModal?.title ?? ''}
        frontIndex={activeModal?.frontIndex}
        frontColumns={activeModal?.frontColumns}
        frontRows={activeModal?.frontRows}
        backSrc={activeModal?.backSrc}
        useTilt={modal?.type !== 'summary' && modal?.type !== 'pointSheet'}
        useGlow={modal?.type !== 'summary' && modal?.type !== 'pointSheet'}
        canFlip={
          modal?.type === 'summary' ||
          modal?.type === 'special' ||
          modal?.type === 'environment' ||
          modal?.type === 'bug'
        }
        variant={modal?.type === 'pointSheet' || modal?.type === 'summary' ? 'sheet' : 'card'}
        onClose={() => setModal(null)}
        actions={
          <>
            {modal?.type === 'environment' && !isViewer ? (
              <>
                <div className="player-toggle-group">
                  {state.players.map((player) => (
                    <button
                      key={`buyer-${player.id}`}
                      type="button"
                      className={buyerId === player.id ? 'active' : ''}
                      onClick={() => setSelectedBuyer(player.id)}
                    >
                      {player.name}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const player = state.players.find((entry) => entry.id === buyerId)
                    if (!player) {
                      return
                    }
                    setEnvironmentUndo((prev) => [
                      ...prev,
                      {
                        playerId: buyerId,
                        prevEnvironments: [...player.environments],
                        prevDeck: [...state.environments.deck],
                        prevMarket: [...state.environments.market],
                        prevDiscard: [...state.environments.discard],
                      },
                    ])
                    dispatch({
                      type: 'setPendingEnvironmentBuy',
                      payload: { cardId: modal.id, playerId: buyerId },
                    })
                    dispatch({ type: 'confirmPending', clientId })
                    setModal(null)
                  }}
                >
                  구매
                </button>
              </>
            ) : null}
            {modal?.type === 'bug' && !isViewer ? (
              <button
                type="button"
                onClick={() => {
                  setBugUndo((prev) => [
                    ...prev,
                    {
                      prevDeck: [...state.bugs.deck],
                      prevMarket: [...state.bugs.market],
                      prevDiscard: [...state.bugs.discard],
                    },
                  ])
                  dispatch({ type: 'setPendingBugUse', payload: { cardId: modal.id } })
                  dispatch({ type: 'confirmPending', clientId })
                  setModal(null)
                }}
              >
                사용
              </button>
            ) : null}
            <button type="button" onClick={() => setModal(null)}>
              {isViewer ? '닫기' : '취소'}
            </button>
          </>
        }
      />

      <footer className="status-bar">
        <span>
          Room: {queryRoom}
          {isViewer ? ' · 뷰어' : ''}
        </span>
        <span>
          {isFirebaseConfigured()
            ? isViewer
              ? '실시간 동기화 (읽기 전용)'
              : '실시간 동기화 사용중'
            : '로컬 모드(Firebase 미설정)'}
        </span>
      </footer>
    </div>
  )
}

export default App
