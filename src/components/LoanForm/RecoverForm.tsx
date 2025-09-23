import { useMemo, useState } from 'react'
import type { Prestamo, Equipo } from '../../types/firebase'
import { marcarDevolucion } from '../../services/prestamos'

interface Props {
  lugarId: string
  prestamos: Prestamo[]
  equiposMap: Map<string, Equipo>
  onClose?: () => void
}

export function RecoverForm({ lugarId, prestamos, equiposMap, onClose }: Props) {
  const activos = useMemo(() => {
    return prestamos
      .filter((p) => p.lugarId === lugarId && p.estado === 'prestado')
      .map((p) => ({
        prestamoId: p.id,
        equipoId: p.equipoId,
        codigoUnico: (equiposMap.get(p.equipoId) as any)?.codigoUnico ?? p.equipoId,
      }))
      .sort((a, b) => String(a.codigoUnico).localeCompare(String(b.codigoUnico), undefined, { numeric: true, sensitivity: 'base' }))
  }, [lugarId, prestamos, equiposMap])

  const [seleccion, setSeleccion] = useState<string[]>([])
  const [status, setStatus] = useState<string>('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('')
    if (seleccion.length === 0) { setStatus('Selecciona al menos un equipo'); return }
    for (const prestamoId of seleccion) {
      await marcarDevolucion(prestamoId)
    }
    onClose?.()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-2">
        <label className="text-sm text-slate-700">Equipos prestados</label>
        <div className="grid gap-2 max-h-60 overflow-y-auto p-1 bg-slate-100 rounded">
          {activos.map((x) => {
            const selected = seleccion.includes(x.prestamoId)
            return (
              <button
                key={x.prestamoId}
                type="button"
                aria-pressed={selected}
                className={`w-full px-3 py-2 rounded-md text-sm ring-1 transition font-mono tracking-wide ${selected ? 'btn-ice-red' : 'bg-white text-slate-900 ring-slate-300 hover:bg-slate-50'}`}
                onClick={() => setSeleccion((prev) => prev.includes(x.prestamoId) ? prev.filter(id => id !== x.prestamoId) : [...prev, x.prestamoId])}
              >
                <span className="truncate block text-left">{x.codigoUnico}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{seleccion.length} seleccionado(s)</span>
          {seleccion.length > 0 && (
            <button type="button" className="underline hover:text-slate-700" onClick={() => setSeleccion([])}>Limpiar</button>
          )}
        </div>
      </div>
      {status && <div className="text-sm text-slate-700">{status}</div>}
      <div className="grid grid-cols-2 gap-2">
        <button className="btn-primary rounded-xl" type="submit">Recuperar</button>
        <button className="btn-secondary rounded-xl" type="button" onClick={onClose}>Cancelar</button>
      </div>
    </form>
  )
}



