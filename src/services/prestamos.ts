import { addDoc, collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, Timestamp, updateDoc, where } from 'firebase/firestore'
import { db } from './firebase'
import type { Prestamo } from '../types/firebase'
import { logEvento } from './eventos'

const prestamosCol = collection(db, 'prestamos')

export function listenPrestamosActivos(cb: (prestamos: Prestamo[]) => void) {
  const q = query(prestamosCol, where('estado', '==', 'prestado'), orderBy('fechaPrestamo', 'desc'))
  return onSnapshot(q, (snap) => {
    const data: Prestamo[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Prestamo, 'id'>) }))
    cb(data)
  })
}

export async function preventDuplicateLoan(equipoId: string): Promise<boolean> {
  const q = query(prestamosCol, where('equipoId', '==', equipoId), where('estado', '==', 'prestado'), limit(1))
  const s = await getDocs(q)
  return s.empty
}

export async function createPrestamo(data: Omit<Prestamo, 'id'>) {
  const base = {
    ...data,
    fechaPrestamo: data.fechaPrestamo ?? (serverTimestamp() as unknown as Timestamp),
  }
  const payload = Object.fromEntries(Object.entries(base).filter(([, v]) => v !== undefined)) as Omit<Prestamo, 'id'>
  await addDoc(prestamosCol, payload)
  await logEvento({
    tipo: 'prestamo',
    descripcion: `Equipo prestado`,
    lugarId: data.lugarId,
    equipoId: data.equipoId,
    icono: '✅',
    prioridad: 'media',
  })
}

export async function marcarDevolucion(prestamoId: string) {
  const ref = doc(prestamosCol, prestamoId)
  const snap = await getDoc(ref)
  const data = snap.data() as Partial<Prestamo> | undefined
  await updateDoc(ref, { estado: 'devuelto', fechaDevolucion: serverTimestamp() as any })
  await logEvento({
    tipo: 'devolucion',
    descripcion: `Equipo devuelto`,
    lugarId: data?.lugarId,
    equipoId: data?.equipoId,
    icono: '🔄',
    prioridad: 'baja',
  })
}


