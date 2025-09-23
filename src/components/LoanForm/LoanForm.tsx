import { useEffect, useState } from 'react'
import { createPrestamo, preventDuplicateLoan } from '../../services/prestamos'
import { getEquipoByCodigo, listenEquipos } from '../../services/equipos'
import type { Prestamo } from '../../types/firebase'
import { Timestamp } from 'firebase/firestore'

interface Props { onClose?: () => void; lugarId: string }

export function LoanForm({ onClose, lugarId }: Props) {
  const [codigos, setCodigos] = useState<string[]>([])
  const [status, setStatus] = useState<string>('')
  const [equiposOpts, setEquiposOpts] = useState<Array<{ id: string; codigoUnico: string; nombre: string }>>([])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('')
    if (!codigos.length) { setStatus('Selecciona al menos un equipo'); return }

    for (const code of codigos) {
      const equipo = await getEquipoByCodigo(code)
      if (!equipo) { continue }
      const okDisponible = await preventDuplicateLoan(equipo.id)
      if (!okDisponible) { continue }
      const data: Omit<Prestamo, 'id'> = {
        lugarId,
        equipoId: equipo.id,
        cantidad: 1,
        responsable: '',
        fechaPrestamo: Timestamp.now(),
        fechaDevolucion: undefined,
        estado: 'prestado',
      }
      await createPrestamo(data)
    }
    setStatus('Préstamo registrado')
    onClose?.()
  }

  useEffect(() => {
    const off = listenEquipos((eqs) => {
      const disponibles = eqs.filter((e: any) => e.estado === 'disponible')
        .sort((a: any, b: any) => String(a.codigoUnico).localeCompare(String(b.codigoUnico), undefined, { numeric: true, sensitivity: 'base' }))
      setEquiposOpts(disponibles.map(e => ({ id: e.id, codigoUnico: (e as any).codigoUnico, nombre: e.nombre })))
    })
    return () => off()
  }, [])

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-2">
        <label className="text-sm text-slate-700">Equipos</label>
        <div className="grid gap-2 max-h-60 overflow-y-auto p-1 bg-slate-100 rounded">
          {equiposOpts.map(e => {
            const selected = codigos.includes(e.codigoUnico)
            return (
              <button
                key={e.id}
                type="button"
                aria-pressed={selected}
                className={`w-full px-3 py-2 rounded-md text-sm ring-1 transition font-mono tracking-wide ${selected ? 'btn-ice-red' : 'bg-white text-slate-900 ring-slate-300 hover:bg-slate-50'}`}
                onClick={() => setCodigos((prev) => prev.includes(e.codigoUnico) ? prev.filter(x => x !== e.codigoUnico) : [...prev, e.codigoUnico])}
                title={e.nombre}
              >
                <span className="truncate block text-left">{e.codigoUnico}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{codigos.length} seleccionado(s)</span>
          {codigos.length > 0 && (
            <button type="button" className="underline hover:text-slate-700" onClick={() => setCodigos([])}>Limpiar</button>
          )}
        </div>
      </div>
      {status && <div className="text-sm text-slate-700">{status}</div>}
      <div className="grid grid-cols-2 gap-2">
        <button className="btn-primary rounded-xl" type="submit">Registrar préstamo</button>
        <button className="btn-secondary rounded-xl" type="button" onClick={onClose}>Cancelar</button>
      </div>
    </form>
  )
}


