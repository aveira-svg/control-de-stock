import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import type { Evento, TipoEvento, PrioridadEvento } from '../types/firebase'

const eventosCol = collection(db, 'eventos')

export function listenEventos(cb: (eventos: Evento[]) => void, max = 15) {
  const q = query(eventosCol, orderBy('timestamp', 'desc'), limit(max))
  return onSnapshot(q, (snap) => {
    const data: Evento[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Evento, 'id'>) }))
    cb(data)
  })
}

export async function logEvento(params: {
  tipo: TipoEvento
  descripcion: string
  lugarId?: string
  equipoId?: string
  responsable?: string
  icono: string
  prioridad?: PrioridadEvento
}) {
  await addDoc(eventosCol, {
    ...params,
    prioridad: params.prioridad ?? 'baja',
    timestamp: serverTimestamp() as any,
  })
}


