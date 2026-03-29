import { useEffect, useState } from 'react'
import { PLAYER_COLOR_HEX } from '../../data/cards'
import type { PlayerColor } from '../../types/game'
import type { ReactNode } from 'react'
import { useCardTilt } from '../../hooks/useCardTilt'
import { CardImage } from '../common/CardImage'

type ModalViewerProps = {
  open: boolean
  title: string
  frontSrc: string
  frontAlt: string
  frontIndex?: number
  frontColumns?: number
  frontRows?: number
  backSrc?: string
  onClose: () => void
  actions?: ReactNode
  useTilt?: boolean
  useGlow?: boolean
  canFlip?: boolean
  variant?: 'card' | 'sheet'
}

export function ModalViewer({
  open,
  title,
  frontSrc,
  frontAlt,
  frontIndex,
  frontColumns,
  frontRows,
  backSrc,
  onClose,
  actions,
  useTilt = true,
  useGlow = true,
  canFlip = Boolean(backSrc),
  variant = 'card',
}: ModalViewerProps) {
  const [flipped, setFlipped] = useState(false)
  const tilt = useCardTilt()

  useEffect(() => {
    if (open) {
      setFlipped(false)
    }
  }, [open, title, frontSrc])

  if (!open) {
    return null
  }

  const isSheet = variant === 'sheet'

  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <div
        className={`modal ${isSheet ? 'modal-sheet' : ''}`}
        role="dialog"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-head">
          <h3>{title}</h3>
          <button onClick={onClose}>닫기</button>
        </header>
        {isSheet && !backSrc ? (
          <div className="modal-sheet-body">
            <img className="modal-sheet-img" src={frontSrc} alt={frontAlt} />
          </div>
        ) : null}
        {isSheet && backSrc ? (
          <div className="modal-sheet-body modal-sheet-bodyflip">
            <div
              className={`flip-card ${flipped ? 'flipped' : ''} ${canFlip && backSrc ? 'clickable' : ''} flip-card-sheet`}
              onClick={canFlip && backSrc ? () => setFlipped((value) => !value) : undefined}
            >
              <div className="flip-face front">
                <img className="modal-sheet-img" src={frontSrc} alt={frontAlt} />
              </div>
              <div className="flip-face back">
                <img className="modal-sheet-img" src={backSrc} alt={`${frontAlt} 뒷면`} />
              </div>
            </div>
          </div>
        ) : null}
        {!isSheet ? (
          <div
            className="tilt-wrap"
            onMouseMove={useTilt ? tilt.onMove : undefined}
            onMouseLeave={useTilt ? tilt.onLeave : undefined}
          >
            <div
              className={`flip-card ${flipped ? 'flipped' : ''} ${canFlip && backSrc ? 'clickable' : ''}`}
              style={useTilt ? tilt.style : undefined}
              onClick={canFlip && backSrc ? () => setFlipped((value) => !value) : undefined}
            >
              <div className="flip-face front">
                <CardImage
                  src={frontSrc}
                  index={frontIndex}
                  columns={frontColumns}
                  rows={frontRows}
                  alt={frontAlt}
                  className="modal-card-image"
                  placeholderLabel={frontAlt}
                />
              </div>
              <div className="flip-face back">
                <CardImage
                  src={backSrc ?? frontSrc}
                  alt={`${frontAlt} 뒷면`}
                  className="modal-card-image"
                  placeholderLabel="뒷면"
                />
              </div>
              {useGlow ? <div className="card-glow" /> : null}
            </div>
          </div>
        ) : null}
        <div className="modal-actions">{actions}</div>
      </div>
    </div>
  )
}

type ScoreMoveDialogProps = {
  open: boolean
  trackIndex: 1 | 2 | 3
  playerId: string
  players: Array<{ id: string; name: string; color: string }>
  steps: number
  costLabel: string
  maxSteps: number
  onSelectPlayer: (id: string) => void
  onChangeStep: (step: number) => void
  onConfirm: () => void
  onCancel: () => void
}

export function ScoreMoveDialog({
  open,
  trackIndex,
  playerId,
  players,
  steps,
  costLabel,
  maxSteps,
  onSelectPlayer,
  onChangeStep,
  onConfirm,
  onCancel,
}: ScoreMoveDialogProps) {
  if (!open) {
    return null
  }

  const canStep = maxSteps > 0

  return (
    <div className="overlay" role="presentation" onClick={onCancel}>
      <div className="modal small" role="dialog" onClick={(event) => event.stopPropagation()}>
        <h3>점수트랙 {trackIndex} 전진</h3>
        <div className="token-toggle-row">
          {players.map((player) => (
            <button
              key={player.id}
              className={playerId === player.id ? 'active' : ''}
              style={{ borderColor: PLAYER_COLOR_HEX[player.color as PlayerColor] }}
              onClick={() => onSelectPlayer(player.id)}
            >
              {player.name}
            </button>
          ))}
        </div>
        <div className="stepper">
          <button
            type="button"
            disabled={!canStep || steps <= 1}
            onClick={() => onChangeStep(Math.max(1, steps - 1))}
          >
            ◀
          </button>
          <strong>{canStep ? `${steps}칸` : '종점'}</strong>
          <button
            type="button"
            disabled={!canStep || steps >= maxSteps}
            onClick={() => onChangeStep(Math.min(maxSteps, steps + 1))}
          >
            ▶
          </button>
        </div>
        <p className="score-move-cost">{canStep ? `필요 자원: ${costLabel}` : '이 트랙의 끝에 도달했습니다.'}</p>
        <div className="modal-actions">
          <button type="button" onClick={onConfirm} disabled={!canStep || steps < 1}>
            확인
          </button>
          <button type="button" onClick={onCancel}>
            취소
          </button>
        </div>
      </div>
    </div>
  )
}
