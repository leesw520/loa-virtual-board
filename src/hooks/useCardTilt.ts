import { useMemo, useState } from 'react'
import type { MouseEventHandler } from 'react'

type TiltStyle = {
  transform: string
  '--glow-x': string
  '--glow-y': string
}

export function useCardTilt() {
  const [tilt, setTilt] = useState({ x: 0, y: 0, glowX: 50, glowY: 50 })

  const style = useMemo<TiltStyle>(
    () => ({
      transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      '--glow-x': `${tilt.glowX}%`,
      '--glow-y': `${tilt.glowY}%`,
    }),
    [tilt],
  )

  const onMove: MouseEventHandler<HTMLDivElement> = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top
    const px = x / bounds.width
    const py = y / bounds.height
    setTilt({
      x: (0.5 - py) * 8,
      y: (px - 0.5) * 8,
      glowX: px * 100,
      glowY: py * 100,
    })
  }

  const onLeave = () => {
    setTilt({ x: 0, y: 0, glowX: 50, glowY: 50 })
  }

  return { style, onMove, onLeave }
}
