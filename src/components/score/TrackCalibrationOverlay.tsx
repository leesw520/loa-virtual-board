import { Fragment, useMemo } from 'react'
import { SCORE_TRACK_MAX_POSITION, trackCellCenter } from '../../data/scoreTracks'

const VERTICAL_DY_PCT = [-7, -5, -3, -1.5, 0, 1.5, 3, 5, 7] as const
const HORIZONTAL_FRAC = [-0.45, -0.25, 0, 0.25, 0.45] as const

/** 주소에 ?trackCalib=1 (또는 trackCalib만) 붙이면 각 칸 중심·세로 눈금 더미 표시 */
export function readTrackCalibEnabled(): boolean {
  const p = new URLSearchParams(window.location.search)
  if (!p.has('trackCalib')) {
    return false
  }
  const v = (p.get('trackCalib') ?? '1').toLowerCase()
  return v !== '0' && v !== 'false' && v !== 'off'
}

type TrackCalibrationOverlayProps = {
  trackIndex: 1 | 2 | 3
}

/** 칸 중심마다 큰 십자 + 번호, 세로로 촘촘한 보조 눈금 */
export function TrackCalibrationOverlay({ trackIndex }: TrackCalibrationOverlayProps) {
  const max = SCORE_TRACK_MAX_POSITION[trackIndex]

  const columns = useMemo(() => {
    const out: Array<{
      pos: number
      leftPct: number
      topPct: number
    }> = []
    for (let pos = 0; pos <= max; pos++) {
      out.push({ pos, ...trackCellCenter(trackIndex, pos) })
    }
    return out
  }, [trackIndex, max])

  const stepAt = (idx: number) => {
    if (columns.length <= 1) {
      return 0
    }
    if (idx <= 0) {
      return columns[1].leftPct - columns[0].leftPct
    }
    if (idx >= columns.length - 1) {
      return columns[idx].leftPct - columns[idx - 1].leftPct
    }
    return (columns[idx + 1].leftPct - columns[idx - 1].leftPct) / 2
  }

  return (
    <div className="track-calib-layer" aria-hidden>
      {columns.map(({ pos, leftPct, topPct }, idx) => (
        <Fragment key={pos}>
          <span
            className="track-calib-label"
            style={{ left: `${leftPct}%`, top: `${topPct - 5.5}%` }}
          >
            {pos}
          </span>
          <span
            className="track-calib-cross track-calib-cross--h"
            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
          />
          <span
            className="track-calib-cross track-calib-cross--v"
            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
          />
          <span className="track-calib-hub" style={{ left: `${leftPct}%`, top: `${topPct}%` }} />
          {VERTICAL_DY_PCT.map((dy) => (
            <span
              key={`v-${pos}-${dy}`}
              className="track-calib-tick track-calib-tick--vert"
              style={{ left: `${leftPct}%`, top: `${topPct + dy}%` }}
            />
          ))}
          {HORIZONTAL_FRAC.map((fr) => (
            <span
              key={`h-${pos}-${fr}`}
              className="track-calib-tick track-calib-tick--horiz"
              style={{
                left: `${leftPct + fr * stepAt(idx)}%`,
                top: `${topPct}%`,
              }}
            />
          ))}
        </Fragment>
      ))}
    </div>
  )
}
