import { useMemo, useState } from 'react'
import { BONUS_LABELS, TRACK_IMAGES } from '../../data/cards'
import {
  TRACK_SPREAD_REF_SLOT,
  trackCellCenter,
  tokenPositionPercent,
} from '../../data/scoreTracks'
import type { GameState } from '../../types/game'
import { imagePath } from '../../utils/assets'
import {
  readClusterCalibEnabled,
  TrackClusterCalibGhost,
  TrackClusterCalibReadout,
} from './TrackClusterCalib'
import { readTrackCalibEnabled, TrackCalibrationOverlay } from './TrackCalibrationOverlay'

type ScoreTracksPanelProps = {
  state: GameState
  readOnly?: boolean
  onOpenMoveDialog: (track: 1 | 2 | 3) => void
  onOpenBonus: (track: 2 | 3) => void
}

function tokenStyle(
  trackIndex: 1 | 2 | 3,
  position: number,
  playerSlot: number,
) {
  const { leftPct, topPct } = tokenPositionPercent(trackIndex, position, playerSlot)
  return {
    left: `${leftPct}%`,
    top: `${topPct}%`,
  }
}

export function ScoreTracksPanel({
  state,
  readOnly = false,
  onOpenMoveDialog,
  onOpenBonus,
}: ScoreTracksPanelProps) {
  const showTrackCalib = useMemo(() => readTrackCalibEnabled(), [])
  const showClusterCalib = useMemo(() => readClusterCalibEnabled(), [])

  const [clusterCenters, setClusterCenters] = useState<
    Record<1 | 2 | 3, { leftPct: number; topPct: number }>
  >(() => ({
    1: { ...trackCellCenter(1, 0) },
    2: { ...trackCellCenter(2, 0) },
    3: { ...trackCellCenter(3, 0) },
  }))
  const [clusterRefSlot, setClusterRefSlot] = useState<Record<1 | 2 | 3, number>>({
    1: TRACK_SPREAD_REF_SLOT[1],
    2: TRACK_SPREAD_REF_SLOT[2],
    3: TRACK_SPREAD_REF_SLOT[3],
  })
  const [clusterRecordSlot, setClusterRecordSlot] = useState<Record<1 | 2 | 3, number>>({
    1: 0,
    2: 0,
    3: 0,
  })
  const [armedTrack, setArmedTrack] = useState<null | 1 | 2 | 3>(null)

  return (
    <section className="panel">
      <div className="section-head">
        <h2>점수 트랙</h2>
      </div>
      {showClusterCalib ? (
        <p className="track-cluster-calib-banner">
          <strong>뭉치 정렬 모드</strong> — 4토큰 영역 클릭 → 트랙 이미지 클릭으로 중심 이동. 아래 출력을{' '}
          <code>scoreTracks.ts</code>에 붙여 넣으세요. 끝내려면 URL에서 <code>clusterCalib</code> 를 빼고
          새로고침하세요.
        </p>
      ) : null}
      <details className="track-cost-legend">
        <summary>칸 전진 비용 (별 = 시작칸)</summary>
        <ul>
          <li>
            <strong>트랙 1 · 잎사귀</strong> — 1칸 1, 2~3칸 각 2, 4~5칸 각 3, 6칸 4, 7칸 5, 8칸 6, 9칸
            7 (최대 9칸)
          </li>
          <li>
            <strong>트랙 2 · 잎사귀</strong> — 1칸 1, 2~3칸 각 2, 4~6칸 각 3, 7~8칸 각 4, 9칸 5, 10칸 6 (최대
            10칸)
          </li>
          <li>
            <strong>트랙 3 · 물</strong> — 1칸 1, 2~3칸 각 2, 4~6칸 각 3, 7~8칸 각 4, 9칸 5, 10칸 6 (최대 10칸)
          </li>
        </ul>
        <p className="muted track-cost-note">
          칸 가로 위치는 <code>TRACK_SLOT_LEFT_PCT</code>, 세로는 <code>TRACK_TOKEN_GEOMETRY.topPct</code> 로
          맞춥니다. 실제 PNG와 어긋나면 <code>src/data/scoreTracks.ts</code>에서 수정하세요. 칸 중심
          더미·눈금은 <code>?trackCalib=1</code> (끄기 <code>trackCalib=0</code>). 4토큰 뭉치를 직접 찍어
          맞추려면 <code>?clusterCalib=1</code> — 뭉치 클릭 후 이미지 클릭으로 이동·좌표 복사.
        </p>
      </details>
      <div className="track-list">
        {TRACK_IMAGES.map((track, index) => {
          const trackIndex = (index + 1) as 1 | 2 | 3
          return (
            <article key={track} className="track-card">
              <div
                className={`track-image-wrap${armedTrack === trackIndex ? ' track-image-wrap--calib-armed' : ''}`}
                onClick={(e) => {
                  if (!showClusterCalib || armedTrack !== trackIndex) {
                    return
                  }
                  const wrap = e.currentTarget
                  const img = wrap.querySelector('img')
                  if (!(img instanceof HTMLImageElement)) {
                    return
                  }
                  const rect = img.getBoundingClientRect()
                  const { clientX, clientY } = e
                  if (
                    clientX < rect.left ||
                    clientX > rect.right ||
                    clientY < rect.top ||
                    clientY > rect.bottom
                  ) {
                    return
                  }
                  const leftPct = ((clientX - rect.left) / rect.width) * 100
                  const topPct = ((clientY - rect.top) / rect.height) * 100
                  setClusterCenters((prev) => ({
                    ...prev,
                    [trackIndex]: { leftPct, topPct },
                  }))
                  setArmedTrack(null)
                }}
              >
                <img src={imagePath(track)} alt={`점수트랙 ${trackIndex}`} />
                {showTrackCalib ? <TrackCalibrationOverlay trackIndex={trackIndex} /> : null}
                {showClusterCalib ? (
                  <TrackClusterCalibGhost
                    trackIndex={trackIndex}
                    center={clusterCenters[trackIndex]}
                    refSlot={clusterRefSlot[trackIndex]}
                    armed={armedTrack === trackIndex}
                    onArmCluster={() =>
                      setArmedTrack((prev) => (prev === trackIndex ? null : trackIndex))
                    }
                  />
                ) : null}
                {!showClusterCalib ? (
                  <div className="track-token-layer">
                    {state.players.map((player, slot) => (
                      <span
                        key={`${trackIndex}-${player.id}`}
                        className={`track-token track-token--3d track-token--${player.color}`}
                        style={tokenStyle(trackIndex, state.scoreTracks[trackIndex][player.id] ?? 0, slot)}
                        title={`${player.name}: ${state.scoreTracks[trackIndex][player.id] ?? 0}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              {showClusterCalib ? (
                <TrackClusterCalibReadout
                  trackIndex={trackIndex}
                  center={clusterCenters[trackIndex]}
                  refSlot={clusterRefSlot[trackIndex]}
                  onRefSlotChange={(n) =>
                    setClusterRefSlot((prev) => ({ ...prev, [trackIndex]: n }))
                  }
                  recordSlot={clusterRecordSlot[trackIndex]}
                  onRecordSlotChange={(n) =>
                    setClusterRecordSlot((prev) => ({ ...prev, [trackIndex]: n }))
                  }
                  armed={armedTrack === trackIndex}
                  onRequestArm={() =>
                    setArmedTrack((prev) => (prev === trackIndex ? null : trackIndex))
                  }
                />
              ) : null}
              <div className="track-actions">
                <button
                  type="button"
                  disabled={readOnly}
                  title={readOnly ? '뷰어는 조작할 수 없습니다' : undefined}
                  onClick={() => onOpenMoveDialog(trackIndex)}
                >
                  토큰 전진
                </button>
                {(trackIndex === 2 || trackIndex === 3) && (
                  <button type="button" onClick={() => onOpenBonus(trackIndex)}>
                    {BONUS_LABELS[trackIndex]} 보기
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
