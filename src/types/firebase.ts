import type { Timestamp } from 'firebase/firestore'

export interface Lugar {
  id: string
  nombre: string
  activo: boolean
  descripcion?: string
  capacidad?: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type TipoEquipo =
  | 'camara_web'
  | 'presentador'
  | 'teclado_mouse'
  | 'parlantes'
  | 'pc'
  | 'proyector'

export type EstadoEquipo =
  | 'disponible'
  | 'prestado'
  | 'mantenimiento'
  | 'dañado'
  | 'perdido'

export interface Equipo {
  id: string
  codigoUnico: string
  nombre: string
  tipo: TipoEquipo
  marca?: string
  modelo?: string
  numeroSerie?: string
  icono: string
  estado: EstadoEquipo
  ubicacionActual?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type TipoEvento =
  | 'prestamo'
  | 'devolucion'
  | 'lugar_estado'
  | 'nuevo_lugar'
  | 'nuevo_equipo'
  | 'vencido'

export type PrioridadEvento = 'alta' | 'media' | 'baja'

export interface Evento {
  id: string
  tipo: TipoEvento
  descripcion: string
  lugarId?: string
  equipoId?: string
  responsable?: string
  timestamp: Timestamp
  icono: string
  prioridad: PrioridadEvento
}

export type EstadoPrestamo = 'prestado' | 'devuelto' | 'vencido'

export interface Prestamo {
  id: string
  lugarId: string
  equipoId: string
  cantidad: number
  responsable: string
  fechaPrestamo: Timestamp
  fechaDevolucion?: Timestamp
  estado: EstadoPrestamo
  observaciones?: string
}


