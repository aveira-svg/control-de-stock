import { useEffect, useMemo, useState } from 'react'
import { listenEventos } from '../../services/eventos'
import { listenEquipos } from '../../services/equipos'
import { listenLugares } from '../../services/lugares'
import type { Equipo, Evento, Lugar } from '../../types/firebase'

export function EventLog() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [detail, setDetail] = useState<Evento | null>(null)
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [lugares, setLugares] = useState<Lugar[]>([])

  useEffect(() => {
    const off = listenEventos(setEventos, 50)
    const offEq = listenEquipos(setEquipos)
    const offLu = listenLugares(setLugares)
    return () => { off(); offEq(); offLu() }
  }, [])

  const equipoById = useMemo(() => {
    const m = new Map<string, Equipo>()
    for (const e of equipos) m.set((e as any).id ?? (e as any).docId ?? '', e)
    return m
  }, [equipos])

  const lugarById = useMemo(() => {
    const m = new Map<string, Lugar>()
    for (const l of lugares) m.set((l as any).id ?? (l as any).docId ?? '', l)
    return m
  }, [lugares])

  return (
    <>
      <div className="py-2">
        <ul className="text-sm sm:text-[0.95rem] text-slate-900 space-y-1.5 max-h-[40dvh] overflow-y-auto pr-1">
          {eventos.map((e) => (
            <li key={e.id} className="flex items-start gap-2">
              <button className="hover:text-slate-950 font-medium truncate" onClick={() => setDetail(e)}>
                {(() => {
                  const time = new Date(e.timestamp?.toMillis?.() ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  const eq = e.equipoId ? equipoById.get(e.equipoId) : undefined
                  const lu = e.lugarId ? lugarById.get(e.lugarId) : undefined
                  const label = (eq?.codigoUnico || '') + (eq && lu ? ' @ ' : '') + (lu?.nombre || '')
                  const fallback = e.descripcion?.replace(/\([^)]*\)/g, '').trim()
                  const text = label.trim() ? `${e.icono} | ${label}` : `${e.icono} | ${fallback || e.descripcion}`
                  return `[${time}] ${text}`
                })()}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md card max-h-[85dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-slate-950">Detalle de evento</h3>
              <button className="btn-secondary" onClick={() => setDetail(null)}>Cerrar</button>
            </div>
            <div className="text-sm text-slate-700 space-y-1">
              <div><strong>Tipo:</strong> {detail.tipo}</div>
              <div><strong>Descripción:</strong> {detail.descripcion?.replace(/\([^)]*\)/g, '').trim() || detail.descripcion}</div>
              <div><strong>Prioridad:</strong> {detail.prioridad}</div>
              <div><strong>Fecha:</strong> {new Date(detail.timestamp?.toMillis?.() ?? Date.now()).toLocaleString()}</div>
              <div><strong>Lugar:</strong> {(() => { const lu = detail.lugarId ? lugarById.get(detail.lugarId) : undefined; return lu?.nombre || '—' })()}</div>
              <div><strong>Equipo:</strong> {(() => { const eq = detail.equipoId ? equipoById.get(detail.equipoId) : undefined; return eq?.codigoUnico || '—' })()}</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


