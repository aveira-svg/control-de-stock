import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, where, writeBatch } from 'firebase/firestore'
import { db } from './firebase'
import type { Equipo } from '../types/firebase'
import { logEvento } from './eventos'

const equiposCol = collection(db, 'equipos')

export async function getEquipoByCodigo(codigoUnico: string): Promise<Equipo | null> {
  const q = query(equiposCol, where('codigoUnico', '==', codigoUnico))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...(d.data() as Omit<Equipo, 'id'>) }
}

export async function ensureUniqueCodigo(codigoUnico: string): Promise<boolean> {
  const exists = await getEquipoByCodigo(codigoUnico)
  return !exists
}

export async function createEquipo(id: string, data: Omit<Equipo, 'id'>): Promise<void> {
  const ref = doc(equiposCol, id)
  // Firestore no acepta valores undefined: removemos claves undefined
  const sanitized = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as Omit<Equipo, 'id'>
  await setDoc(ref, sanitized)
  await logEvento({
    tipo: 'nuevo_equipo',
    descripcion: `${data.codigoUnico} registrado (${data.nombre})`,
    equipoId: id,
    icono: '📦',
    prioridad: 'baja',
  })
}

export async function getEquipoById(id: string): Promise<Equipo | null> {
  const ref = doc(equiposCol, id)
  const d = await getDoc(ref)
  return d.exists() ? ({ id: d.id, ...(d.data() as Omit<Equipo, 'id'>) }) : null
}

export async function getEquiposByIds(ids: string[]): Promise<Map<string, Equipo>> {
  const result = new Map<string, Equipo>()
  const batch: Promise<void>[] = []
  for (const id of ids) {
    batch.push((async () => {
      const e = await getEquipoById(id)
      if (e) result.set(id, e)
    })())
  }
  await Promise.all(batch)
  return result
}

export async function updateEquipoEstado(id: string, estado: Equipo['estado']): Promise<void> {
  const ref = doc(equiposCol, id)
  const batch = writeBatch(db)
  batch.update(ref, { estado })
  await batch.commit()
}

export function listenEquipos(cb: (equipos: Equipo[]) => void): () => void {
  const q = query(equiposCol, orderBy('nombre'))
  return onSnapshot(q, (snap) => {
    const data: Equipo[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Equipo, 'id'>) }))
    cb(data)
  })
}

export async function updateEquipo(id: string, data: Partial<Omit<Equipo, 'id'>>): Promise<void> {
  const ref = doc(equiposCol, id)
  const sanitized = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined))
  await setDoc(ref, sanitized, { merge: true } as any)
}


