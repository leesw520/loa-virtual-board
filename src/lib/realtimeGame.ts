import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore'
import type { GameState } from '../types/game'

const COLLECTION = 'loa_rooms'

export function subscribeGameState(
  db: Firestore,
  roomId: string,
  onState: (state: GameState) => void,
) {
  const reference = doc(db, COLLECTION, roomId)
  return onSnapshot(reference, (snapshot) => {
    const data = snapshot.data()
    if (!data || !data.state) {
      return
    }
    onState(data.state as GameState)
  })
}

export async function pushGameState(
  db: Firestore,
  roomId: string,
  state: GameState,
) {
  const reference = doc(db, COLLECTION, roomId)
  await setDoc(
    reference,
    {
      state,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}
