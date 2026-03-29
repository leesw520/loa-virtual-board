import { useEffect, useState } from 'react'
import { getCachedNaturalSize, subscribeNaturalSize } from '../../utils/imageNaturalSize'
import { spriteRectByIndex } from '../../utils/sprite'

type CardImageProps = {
  src: string
  alt: string
  className?: string
  index?: number
  columns?: number
  rows?: number
  placeholderLabel?: string
}

function hasImage(value: string) {
  return value.trim().length > 0
}

function aspectFromSheet(size: { w: number; h: number }, columns: number, rows: number) {
  const cardWidth = size.w / columns
  const cardHeight = size.h / rows
  if (cardWidth > 0 && cardHeight > 0) {
    return cardWidth / cardHeight
  }
  return 2 / 3
}

export function CardImage({
  src,
  alt,
  className,
  index,
  columns = 1,
  rows = 1,
  placeholderLabel,
}: CardImageProps) {
  const [aspectRatio, setAspectRatio] = useState<number>(() => {
    if (index === undefined || !hasImage(src)) {
      return 2 / 3
    }
    const cached = getCachedNaturalSize(src)
    return cached ? aspectFromSheet(cached, columns, rows) : 2 / 3
  })

  useEffect(() => {
    if (!hasImage(src) || index === undefined) {
      return
    }
    const cached = getCachedNaturalSize(src)
    if (cached) {
      setAspectRatio(aspectFromSheet(cached, columns, rows))
      return
    }
    return subscribeNaturalSize(src, (size) => {
      setAspectRatio(aspectFromSheet(size, columns, rows))
    })
  }, [src, columns, rows, index])

  if (!hasImage(src)) {
    return <div className={`placeholder-card ${className ?? ''}`}>{placeholderLabel ?? alt}</div>
  }

  if (index === undefined) {
    return <img className={className} src={src} alt={alt} />
  }

  const rect = spriteRectByIndex(index, columns, rows)
  const x = (rect.x / (rect.width - 1 || 1)) * 100
  const y = (rect.y / (rect.height - 1 || 1)) * 100

  return (
    <div
      className={`sprite-card ${className ?? ''}`}
      role="img"
      aria-label={alt}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: `${rect.width * 100}% ${rect.height * 100}%`,
        backgroundPosition: `${x}% ${y}%`,
        aspectRatio,
      }}
    />
  )
}
