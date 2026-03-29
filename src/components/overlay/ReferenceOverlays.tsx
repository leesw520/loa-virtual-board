import { REFERENCE_IMAGES } from '../../data/cards'
import { imagePath } from '../../utils/assets'

type ReferenceOverlaysProps = {
  onOpenPointSheet: () => void
  onOpenSummary: () => void
}

export function ReferenceOverlays({
  onOpenPointSheet,
  onOpenSummary,
}: ReferenceOverlaysProps) {
  return (
    <div className="floating-icons">
      <button onClick={onOpenSummary} className="floating-icon" title="참조표 보기">
        <img src={imagePath(REFERENCE_IMAGES.summaryAction)} alt="참조표" />
      </button>
      <button onClick={onOpenPointSheet} className="floating-icon" title="점수표 보기">
        <img src={imagePath(REFERENCE_IMAGES.pointSheet)} alt="점수표" />
      </button>
    </div>
  )
}
