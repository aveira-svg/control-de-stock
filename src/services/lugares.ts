import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { Lugar } from '../types/firebase'
import { logEvento } from './eventos'

const lugaresCol = collection(db, 'lugares')

export function listenLugares(cb: (lugares: Lugar[]) => void) {
  const q = query(lugaresCol, orderBy('nombre'))
  return onSnapshot(q, (snap) => {
    const data: Lugar[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Lugar, 'id'>) }))
    cb(data)
  })
}

export async function addLugar(nombre: string, descripcion?: string) {
  const now = serverTimestamp() as any
  const ref = await addDoc(lugaresCol, {
    nombre,
    descripcion: descripcion ?? '',
    activo: true,
    createdAt: now,
    updatedAt: now,
  })
  await logEvento({
    tipo: 'nuevo_lugar',
    descripcion: `Nuevo lugar agregado: ${nombre}`,
    lugarId: ref.id,
    icono: '🏢',
    prioridad: 'baja',
  })
}

export async function setEstadoLugar(lugarId: string, activo: boolean) {
  const ref = doc(lugaresCol, lugarId)
  await updateDoc(ref, { activo, updatedAt: serverTimestamp() as any })
  await logEvento({
    tipo: 'lugar_estado',
    descripcion: `Lugar ${activo ? 'activado' : 'desactivado'}`,
    lugarId,
    icono: '🏢',
    prioridad: 'baja',
  })
}

export async function updateLugar(lugarId: string, data: Partial<Omit<Lugar, 'id'>>) {
  const ref = doc(lugaresCol, lugarId)
  const payload = { ...data, updatedAt: serverTimestamp() as any }
  Object.keys(payload).forEach((k) => (payload as any)[k] === undefined && delete (payload as any)[k])
  await updateDoc(ref, payload as any)
  await logEvento({
    tipo: 'lugar_estado',
    descripcion: `Lugar actualizado`,
    lugarId,
    icono: '✏️',
    prioridad: 'baja',
  })
}


