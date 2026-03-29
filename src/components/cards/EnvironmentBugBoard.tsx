import type { DeckState, GameState, Player } from '../../types/game'
import { CARD_BACK_IMAGES } from '../../data/cards'
import { imagePath } from '../../utils/assets'
import { CardImage } from '../common/CardImage'

type EnvironmentBugBoardProps = {
  state: GameState
  readOnly?: boolean
  onOpenEnvironment: (id: number) => void
  onOpenBug: (id: number) => void
  onRefreshToggle: () => void
}

function DeckPile({
  count,
  backAsset,
  prefix,
}: {
  count: number
  backAsset: string
  prefix: string
}) {
  const backSrc = imagePath(backAsset)
  const underLift = Math.min(10, 4 + Math.floor(count / 6))

  return (
    <div className="deck-pile-wrap">
      <div className="deck-pile-stack">
        {count > 0 ? (
          <>
            <div
              className="deck-pile-under"
              aria-hidden
              style={{ transform: `translateY(${underLift}px) scale(0.97)` }}
            />
            <div className="deck-pile-face-frame">
              <img src={backSrc} alt="" className="deck-pile-face" />
            </div>
          </>
        ) : (
          <div className="deck-pile-empty" aria-hidden />
        )}
      </div>
      <span className="deck-pile-badge">
        {prefix} {count}
      </span>
    </div>
  )
}

function DeckColumn({
  title,
  deck,
  onOpen,
  spriteName,
  backAsset,
  readOnly,
}: {
  title: string
  deck: DeckState
  onOpen: (id: number) => void
  spriteName: 'environments' | 'bugs'
  backAsset: string
  readOnly?: boolean
}) {
  return (
    <div className="deck-grid">
      <div className="stack-cell">
        <DeckPile count={deck.deck.length} backAsset={backAsset} prefix="덱" />
      </div>
      {deck.market.map((id) => (
        <button
          key={`${title}-${id}`}
          type="button"
          className={`card-button${readOnly ? ' card-button-viewer' : ''}`}
          title={readOnly ? `${title} 공개 카드 — 확대 보기` : undefined}
          onClick={() => onOpen(id)}
        >
          <CardImage
            src={imagePath(spriteName)}
            index={id}
            columns={10}
            rows={5}
            alt={`${title} 카드 ${id + 1}`}
            className="market-card"
            placeholderLabel={`${title} ${id + 1}`}
          />
        </button>
      ))}
      <div className="stack-cell">
        <DeckPile count={deck.discard.length} backAsset={backAsset} prefix="사용" />
      </div>
    </div>
  )
}

function PlayerOptions({
  players,
  selectedPlayerId,
  onChange,
  readOnly,
}: {
  players: Player[]
  selectedPlayerId: string
  onChange: (id: string) => void
  readOnly?: boolean
}) {
  return (
    <div className="player-toggle-group">
      {players.map((player) => (
        <button
          key={`buy-player-${player.id}`}
          type="button"
          className={selectedPlayerId === player.id ? 'active' : ''}
          disabled={readOnly}
          title={readOnly ? '뷰어는 조작할 수 없습니다' : undefined}
          onClick={() => onChange(player.id)}
        >
          {player.name}
        </button>
      ))}
    </div>
  )
}

export function EnvironmentBugBoard({
  state,
  readOnly = false,
  onOpenEnvironment,
  onOpenBug,
  onRefreshToggle,
}: EnvironmentBugBoardProps) {
  const activePlayer =
    state.pendingAction?.type === 'environmentBuy' ? state.pendingAction.playerId : state.players[0]?.id

  return (
    <section className="panel">
      <div className="section-head">
        <h2>지형 / 곤충 카드</h2>
        <button
          type="button"
          className={state.canSelectMarket ? 'active' : ''}
          disabled={readOnly}
          title={readOnly ? '뷰어는 조작할 수 없습니다' : undefined}
          onClick={onRefreshToggle}
        >
          갱신 {state.canSelectMarket ? 'ON' : 'OFF'}
        </button>
      </div>
      <p className="muted">
        갱신 ON 상태에서 카드 선택 가능, 확정 시 사용더미 이동 후 새 카드가 보충됩니다.
      </p>
      <h3>지형 카드</h3>
      <PlayerOptions
        players={state.players}
        selectedPlayerId={activePlayer}
        readOnly={readOnly}
        onChange={() => {}}
      />
      <DeckColumn
        title="지형"
        deck={state.environments}
        readOnly={readOnly}
        onOpen={onOpenEnvironment}
        spriteName="environments"
        backAsset={CARD_BACK_IMAGES.environments}
      />
      <h3>곤충 카드</h3>
      <DeckColumn
        title="곤충"
        deck={state.bugs}
        readOnly={readOnly}
        onOpen={onOpenBug}
        spriteName="bugs"
        backAsset={CARD_BACK_IMAGES.bugs}
      />
    </section>
  )
}
