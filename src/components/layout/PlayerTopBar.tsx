import type { Player } from '../../types/game'
import { CardImage } from '../common/CardImage'
import { imagePath } from '../../utils/assets'

type PlayerTopBarProps = {
  collapsed: boolean
  players: Player[]
  readOnly?: boolean
  onToggle: () => void
  onReset: () => void
  onOpenSpecialAnimal: (id: number) => void
  onOpenEnvironment: (id: number) => void
}

const SLOT_COUNT = 4

function EnvironmentThumbs({
  cardIds,
  compact,
  readOnly,
  onOpen,
}: {
  cardIds: number[]
  compact?: boolean
  readOnly?: boolean
  onOpen: (id: number) => void
}) {
  if (cardIds.length === 0) {
    return null
  }

  return (
    <div
      className={`player-env-strip${compact ? ' player-env-strip--compact' : ''}`}
      aria-label="귀속 지형 카드"
    >
      {cardIds.map((id, index) =>
        readOnly ? (
          <div
            key={`env-${index}-${id}`}
            className="player-env-thumb-readonly"
            title={`지형 카드 ${id + 1}`}
          >
            <CardImage
              src={imagePath('environments')}
              index={id}
              columns={10}
              rows={5}
              alt={`지형 카드 ${id + 1}`}
              className="player-env-thumb"
              placeholderLabel={`${id + 1}`}
            />
          </div>
        ) : (
          <button
            key={`env-${index}-${id}`}
            type="button"
            className="card-button player-env-thumb-btn"
            onClick={() => onOpen(id)}
            title={`지형 카드 ${id + 1}`}
          >
            <CardImage
              src={imagePath('environments')}
              index={id}
              columns={10}
              rows={5}
              alt={`지형 카드 ${id + 1}`}
              className="player-env-thumb"
              placeholderLabel={`${id + 1}`}
            />
          </button>
        ),
      )}
    </div>
  )
}

export function PlayerTopBar({
  collapsed,
  players,
  readOnly = false,
  onToggle,
  onReset,
  onOpenSpecialAnimal,
  onOpenEnvironment,
}: PlayerTopBarProps) {
  const slots = Array.from({ length: SLOT_COUNT }, (_, index) => players[index])

  return (
    <header className="player-topbar">
      <div className="player-topbar-inner">
        <button type="button" className="player-toggle-btn" onClick={onToggle}>
          {collapsed ? '펼치기' : '접기'}
        </button>

        <div className="player-topbar-slots" aria-label="플레이어 슬롯">
          {slots.map((player, index) =>
            player ? (
              collapsed ? (
                <div key={player.id} className={`player-slot player-chip player-${player.color}`}>
                  <span className="player-chip-name">{player.name}</span>
                  <small className="player-chip-meta">지형 {player.environments.length}장</small>
                  <EnvironmentThumbs
                    cardIds={player.environments}
                    compact
                    readOnly={readOnly}
                    onOpen={onOpenEnvironment}
                  />
                </div>
              ) : (
                <article key={player.id} className={`player-slot player-card-inline player-${player.color}`}>
                  <h3>{player.name}</h3>
                  {readOnly ? (
                    <div className="special-card-hit-readonly" aria-label={`${player.name} 특수동물`}>
                      <CardImage
                        src={imagePath('special_animals')}
                        index={player.specialAnimalId}
                        columns={3}
                        rows={3}
                        alt={`${player.name} 특수동물`}
                        className="mini-special"
                        placeholderLabel="특수"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="card-button special-card-hit"
                      onClick={() => onOpenSpecialAnimal(player.specialAnimalId)}
                    >
                      <CardImage
                        src={imagePath('special_animals')}
                        index={player.specialAnimalId}
                        columns={3}
                        rows={3}
                        alt={`${player.name} 특수동물`}
                        className="mini-special"
                        placeholderLabel="특수"
                      />
                    </button>
                  )}
                  <p className="player-terrain-count">지형 {player.environments.length}장</p>
                  <EnvironmentThumbs
                    cardIds={player.environments}
                    readOnly={readOnly}
                    onOpen={onOpenEnvironment}
                  />
                </article>
              )
            ) : (
              <div key={`empty-${index}`} className="player-slot player-slot-empty" aria-hidden />
            ),
          )}
        </div>

        {readOnly ? (
          <div className="player-reset-placeholder" aria-hidden />
        ) : (
          <button type="button" className="player-reset-btn" onClick={onReset}>
            초기화
          </button>
        )}
      </div>
    </header>
  )
}
