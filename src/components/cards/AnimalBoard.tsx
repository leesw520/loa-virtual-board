import { BASIC_ANIMAL_KEYS } from '../../data/cards'
import { imagePath } from '../../utils/assets'
import { CardImage } from '../common/CardImage'

type AnimalBoardProps = {
  onOpenBasic: (id: number) => void
}

export function AnimalBoard({ onOpenBasic }: AnimalBoardProps) {
  return (
    <section className="panel">
      <h2>기본 동물 카드</h2>
      <div className="animal-grid">
        {BASIC_ANIMAL_KEYS.map((id) => (
          <button key={`basic-${id}`} className="card-button" onClick={() => onOpenBasic(id)}>
            <CardImage
              src={imagePath(id % 2 === 0 ? 'basic_animals_ac' : 'basic_animals_bd')}
              index={id}
              columns={4}
              rows={4}
              alt={`기본동물 ${id + 1}`}
              className="basic-card"
              placeholderLabel={`기본 ${id + 1}`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
