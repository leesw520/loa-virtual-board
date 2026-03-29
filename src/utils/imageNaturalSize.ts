/** 같은 이미지 URL에 대해 브라우저 로드·디코딩을 한 번만 수행하고 치수를 공유합니다. */
type Size = { w: number; h: number }

const sizeCache = new Map<string, Size>()
const listeners = new Map<string, Array<(size: Size) => void>>()

function notify(src: string, size: Size) {
  sizeCache.set(src, size)
  const ls = listeners.get(src)
  listeners.delete(src)
  ls?.forEach((fn) => fn(size))
}

export function getCachedNaturalSize(src: string): Size | undefined {
  return sizeCache.get(src)
}

/** 로드 완료 시 콜백. 이미 캐시에 있으면 동기 호출. 언마운트 시 cleanup 호출. */
export function subscribeNaturalSize(src: string, onReady: (size: Size) => void): () => void {
  const hit = sizeCache.get(src)
  if (hit) {
    onReady(hit)
    return () => {}
  }

  let list = listeners.get(src)
  if (!list) {
    list = []
    listeners.set(src, list)
    const img = new Image()
    img.onload = () => {
      const size = { w: img.naturalWidth, h: img.naturalHeight }
      notify(src, size)
    }
    img.onerror = () => {
      notify(src, { w: 0, h: 0 })
    }
    img.src = src
  }

  list.push(onReady)
  return () => {
    const current = listeners.get(src)
    if (!current) {
      return
    }
    const next = current.filter((fn) => fn !== onReady)
    if (next.length === 0) {
      listeners.delete(src)
    } else {
      listeners.set(src, next)
    }
  }
}
