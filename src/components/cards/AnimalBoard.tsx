import { basicAnimalSprite } from '../../data/basicAnimalFaces'
import { BASIC_ANIMAL_KEYS } from '../../data/cards'
import type { BasicAnimalFace } from '../../types/game'
import { imagePath } from '../../utils/assets'
import { CardImage } from '../common/CardImage'

type AnimalBoardProps = {
  basicAnimalFaces: BasicAnimalFace[]
  onOpenBasic: (id: number) => void
}

export function AnimalBoard({ basicAnimalFaces, onOpenBasic }: AnimalBoardProps) {
  return (
    <section className="panel">
      <h2>기본 동물 카드</h2>
      <div className="animal-grid">
        {BASIC_ANIMAL_KEYS.map((id) => {
          const face = basicAnimalFaces[id] ?? 'A'
          const { asset, spriteIndex } = basicAnimalSprite(id, face)
          return (
            <button key={`basic-${id}`} type="button" className="card-button" onClick={() => onOpenBasic(id)}>
              <CardImage
                src={imagePath(asset)}
                index={spriteIndex}
                columns={4}
                rows={4}
                alt={`기본동물 ${id + 1} (${face}면)`}
                className="basic-card"
                placeholderLabel={`기본 ${id + 1}`}
              />
            </button>
          )
        })}
      </div>
    </section>
  )
}
