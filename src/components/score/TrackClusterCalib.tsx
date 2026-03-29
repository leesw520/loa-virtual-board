import {
  SCORE_TRACK_MAX_POSITION,
  tokenOffsetsFromClusterCenter,
} from '../../data/scoreTracks'

/** 주소에 ?clusterCalib=1 — 4토큰 뭉치를 클릭 후 트랙 이미지 클릭으로 옮기고 좌표를 복사 */
export function readClusterCalibEnabled(): boolean {
  const p = new URLSearchParams(window.location.search)
  if (!p.has('clusterCalib')) {
    return false
  }
  const v = (p.get('clusterCalib') ?? '1').toLowerCase()
  return v !== '0' && v !== 'false' && v !== 'off'
}

/** 2×2 순서: 좌상 흰 → 우상 노 → 좌하 초 → 우하 파 */
const GHOST_COLORS = ['red', 'yellow', 'green', 'blue'] as const

type TrackClusterCalibGhostProps = {
  trackIndex: 1 | 2 | 3
  center: { leftPct: number; topPct: number }
  refSlot: number
  armed: boolean
  onArmCluster: () => void
}

export function TrackClusterCalibGhost({
  trackIndex,
  center,
  refSlot,
  armed,
  onArmCluster,
}: TrackClusterCalibGhostProps) {
  return (
    <div className="track-cluster-calib-layer">
      <span
        className="track-cluster-calib-center-dot"
        style={{ left: `${center.leftPct}%`, top: `${center.topPct}%` }}
        aria-hidden
      />
      {GHOST_COLORS.map((color, slot) => {
        const { leftPct, topPct } = tokenOffsetsFromClusterCenter(
          trackIndex,
          refSlot,
          center,
          slot,
        )
        return (
          <span
            key={color}
            className={`track-token track-token--3d track-token--${color} track-cluster-calib-token`}
            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
            aria-hidden
          />
        )
      })}
      <div
        className={`track-cluster-calib-arm-area ${armed ? 'track-cluster-calib-arm-area--armed' : ''}`}
        style={{ left: `${center.leftPct}%`, top: `${center.topPct}%` }}
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation()
          onArmCluster()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onArmCluster()
          }
        }}
        title="클릭: 이동 대기 → 다음은 트랙 이미지 클릭"
      />
    </div>
  )
}

type TrackClusterCalibReadoutProps = {
  trackIndex: 1 | 2 | 3
  center: { leftPct: number; topPct: number }
  refSlot: number
  onRefSlotChange: (n: number) => void
  recordSlot: number
  onRecordSlotChange: (n: number) => void
  armed: boolean
  onRequestArm: () => void
}

export function TrackClusterCalibReadout({
  trackIndex,
  center,
  refSlot,
  onRefSlotChange,
  recordSlot,
  onRecordSlotChange,
  armed,
  onRequestArm,
}: TrackClusterCalibReadoutProps) {
  const max = SCORE_TRACK_MAX_POSITION[trackIndex]
  const left = center.leftPct.toFixed(2)
  const top = center.topPct.toFixed(2)

  const snippet = `// 트랙 ${trackIndex} — 칸 ${recordSlot} 기준으로 맞췄을 때
TRACK_SLOT_LEFT_PCT[${trackIndex}][${recordSlot}] = ${left}
// 세로(모든 칸 공통이면):
TRACK_TOKEN_GEOMETRY[${trackIndex}].topPct = ${top}`

  const copy = () => {
    void navigator.clipboard?.writeText(snippet)
  }

  return (
    <div className="track-cluster-calib-readout">
      <p className="track-cluster-calib-hint">
        {armed
          ? '→ 트랙 이미지에서 뭉치 중심이 갈 위치를 클릭하세요.'
          : '① 뭉치 위 점선 사각형 클릭(또는 아래 버튼) → ② 트랙 이미지 클릭. 아래 값을 scoreTracks.ts에 반영하세요.'}
      </p>
      <div className="track-cluster-calib-controls">
        <button type="button" className="track-cluster-calib-arm-btn" onClick={onRequestArm}>
          {armed ? '이동 대기 취소' : '이동 대기 (또는 뭉치 클릭)'}
        </button>
        <label>
          2×2 간격 미리보기 기준 칸
          <select
            value={refSlot}
            onChange={(e) => onRefSlotChange(Number(e.target.value))}
          >
            {Array.from({ length: max + 1 }, (_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </label>
        <label>
          메모용(배열 인덱스)
          <select
            value={recordSlot}
            onChange={(e) => onRecordSlotChange(Number(e.target.value))}
          >
            {Array.from({ length: max + 1 }, (_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={copy}>
          복사
        </button>
      </div>
      <pre className="track-cluster-calib-pre">{snippet}</pre>
      <p className="muted track-cluster-calib-mini">
        중심 좌표: <strong>left {left}%</strong> · <strong>top {top}%</strong> (이미지 기준). 실제 플레이
        중 2×2 간격은 <code>scoreTracks.ts</code>의 <code>TRACK_SPREAD_REF_SLOT</code> 칸으로만
        결정됩니다 — 간격을 바꾸려면 그 상수를 수정하세요.
      </p>
    </div>
  )
}
