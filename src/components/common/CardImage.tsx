import { useEffect, useState } from 'react'
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

export function CardImage({
  src,
  alt,
  className,
  index,
  columns = 1,
  rows = 1,
  placeholderLabel,
}: CardImageProps) {
  const [aspectRatio, setAspectRatio] = useState<number>(2 / 3)

  useEffect(() => {
    if (!hasImage(src)) {
      return
    }
    const img = new Image()
    img.src = src
    img.onload = () => {
      const cardWidth = img.naturalWidth / columns
      const cardHeight = img.naturalHeight / rows
      if (cardWidth > 0 && cardHeight > 0) {
        setAspectRatio(cardWidth / cardHeight)
      }
    }
  }, [src, columns, rows])

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
