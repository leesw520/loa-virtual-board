import { useMemo, useState } from 'react'
import { PLAYER_COLORS } from '../../data/cards'
import type { PlayerColor, PlayerSetup } from '../../types/game'

type IntroScreenProps = {
  onStart: (payload: { players: PlayerSetup[]; randomBasicAnimalFaces: boolean }) => void
}

const COLOR_LABELS: Record<PlayerColor, string> = {
  red: '흰색',
  yellow: '노랑',
  green: '초록',
  blue: '파랑',
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  const [count, setCount] = useState(4)
  const [randomBasicAnimalFaces, setRandomBasicAnimalFaces] = useState(false)
  const [rows, setRows] = useState<Array<{ name: string; color: PlayerColor }>>(() =>
    Array.from({ length: 4 }, (_, i) => ({
      name: `Player ${i + 1}`,
      color: PLAYER_COLORS[i] as PlayerColor,
    })),
  )

  const colorOptions = useMemo(() => [...PLAYER_COLORS], [])

  const setPlayerCount = (next: number) => {
    setCount(next)
    setRows((prev) => {
      const nextRows = [...prev]
      while (nextRows.length < next) {
        const i = nextRows.length
        nextRows.push({
          name: `Player ${i + 1}`,
          color: PLAYER_COLORS[i % PLAYER_COLORS.length] as PlayerColor,
        })
      }
      return nextRows.slice(0, next)
    })
  }

  const updateRow = (index: number, patch: Partial<{ name: string; color: PlayerColor }>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  const colorsUsed = rows.map((r) => r.color)
  const duplicateColors = colorsUsed.filter((c, i) => colorsUsed.indexOf(c) !== i)
  const canStart = duplicateColors.length === 0 && rows.length >= 2

  return (
    <div className="intro-screen">
      <div className="intro-card">
        <h1>Life of Amazonia (Support Tool)</h1>
        <p className="intro-lead">플레이어 수와 이름, 색을 정한 뒤 시작하세요.</p>

        <label className="intro-field">
          <span>플레이어 수</span>
          <select value={count} onChange={(e) => setPlayerCount(Number(e.target.value))}>
            <option value={2}>2명</option>
            <option value={3}>3명</option>
            <option value={4}>4명</option>
          </select>
        </label>

        <div className="intro-players">
          {rows.map((row, index) => (
            <div key={index} className="intro-player-row">
              <label>
                <span className="sr-only">이름 {index + 1}</span>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateRow(index, { name: e.target.value })}
                  placeholder={`플레이어 ${index + 1}`}
                />
              </label>
              <label>
                <span className="sr-only">색 {index + 1}</span>
                <select
                  value={row.color}
                  onChange={(e) => updateRow(index, { color: e.target.value as PlayerColor })}
                >
                  {colorOptions.map((c) => (
                    <option key={c} value={c}>
                      {COLOR_LABELS[c]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>

        {duplicateColors.length > 0 ? (
          <p className="intro-error">색은 플레이어 간에 겹치지 않게 선택해 주세요.</p>
        ) : null}

        <label className="intro-option">
          <input
            type="checkbox"
            checked={randomBasicAnimalFaces}
            onChange={(e) => setRandomBasicAnimalFaces(e.target.checked)}
          />
          <span>무작위 기본 동물 면 선택 (각 종류별 A/B/C/D 중 무작위)</span>
        </label>

        <button
          type="button"
          className="intro-start"
          disabled={!canStart}
          onClick={() => onStart({ players: rows, randomBasicAnimalFaces })}
        >
          시작
        </button>
      </div>
    </div>
  )
}
