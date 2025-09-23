import { useEffect, useMemo, useState } from 'react'
import { listenLugares } from '../services/lugares'
import { listenPrestamosActivos } from '../services/prestamos'
import type { Lugar, Prestamo } from '../types/firebase'
import { LocationCard } from '../components/LocationCard/LocationCard'
import { EventLog } from '../components/EventLog/EventLog'
import { LoanForm } from '../components/LoanForm/LoanForm'
import { RecoverForm } from '../components/LoanForm/RecoverForm'
import { getEquiposByIds } from '../services/equipos'
// import { marcarDevolucion } from '../services/prestamos'
import { setEstadoLugar } from '../services/lugares'

export default function Dashboard() {
  const [lugares, setLugares] = useState<Lugar[]>([])
  const [prestamos, setPrestamos] = useState<Prestamo[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedLugarId, setSelectedLugarId] = useState<string | null>(null)
  const [showRecover, setShowRecover] = useState(false)
  const [equiposMap, setEquiposMap] = useState<Map<string, any>>(new Map())
  

  useEffect(() => {
    const off1 = listenLugares(setLugares)
    const off2 = listenPrestamosActivos(setPrestamos)
    return () => { off1(); off2() }
  }, [])

  useEffect(() => {
    const ids = Array.from(new Set(prestamos.filter(p => p.estado === 'prestado').map(p => p.equipoId)))
    if (!ids.length) { setEquiposMap(new Map()); return }
    getEquiposByIds(ids).then(setEquiposMap)
  }, [prestamos])

  const resumenPorLugar = useMemo(() => {
    const map = new Map<string, { prestados: number; vencidos: number }>()
    for (const l of lugares) map.set(l.id, { prestados: 0, vencidos: 0 })
    const now = Date.now()
    for (const p of prestamos) {
      const r = map.get(p.lugarId) || { prestados: 0, vencidos: 0 }
      const isPrestado = p.estado === 'prestado'
      const due = (p.fechaDevolucion as any)?.toMillis?.() as number | undefined
      const isVencido = isPrestado && typeof due === 'number' && due < now
      if (isPrestado) r.prestados += 1
      if (isVencido) r.vencidos += 1
      map.set(p.lugarId, r)
    }
    return map
  }, [lugares, prestamos])

  const lugaresFiltrados = useMemo(() => lugares, [lugares])

  

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 md:pb-6">
        {lugaresFiltrados.map((l) => (
          <LocationCard
            key={l.id}
            nombre={l.nombre}
            activo={l.activo}
            resumen={resumenPorLugar.get(l.id) || { prestados: 0, vencidos: 0 }}
            prestados={prestamos.filter(p => p.lugarId === l.id && p.estado === 'prestado').map(p => (equiposMap.get(p.equipoId)?.codigoUnico) || p.equipoId)}
            onPrestar={() => { setSelectedLugarId(l.id); setShowForm(true) }}
            onDevolver={() => {
              setSelectedLugarId(l.id); setShowRecover(true)
            }}
            onToggleActivo={() => setEstadoLugar(l.id, !l.activo)}
          />
        ))}
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-xl flex items-start justify-center p-4 overflow-y-auto animate-fade">
          <div className="w-full max-w-md card max-h-[85dvh] overflow-y-auto animate-in rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-slate-950">Registrar préstamo</h3>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cerrar</button>
            </div>
            <LoanForm lugarId={selectedLugarId ?? ''} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
      {showRecover && (
        <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-xl flex items-start justify-center p-4 overflow-y-auto animate-fade">
          <div className="w-full max-w-md card max-h-[85dvh] overflow-y-auto animate-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-slate-950">Recuperar equipos</h3>
              <button className="btn-secondary" onClick={() => setShowRecover(false)}>Cerrar</button>
            </div>
            <RecoverForm lugarId={selectedLugarId ?? ''} prestamos={prestamos} equiposMap={equiposMap as any} onClose={() => setShowRecover(false)} />
          </div>
        </div>
      )}
      <div className="mt-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <EventLog />
        </div>
      </div>
    </>
  )
}


