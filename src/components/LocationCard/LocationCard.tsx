import { Circle, TriangleAlert, Plus, RotateCcw } from 'lucide-react'

interface Props {
  nombre: string
  activo: boolean
  resumen: { prestados: number; vencidos: number }
  prestados?: string[]
  onPrestar?: () => void
  onDevolver?: () => void
  onHistorial?: () => void
  onToggleActivo?: () => void
}

export function LocationCard({ nombre, activo, resumen, prestados = [], onPrestar, onDevolver, onToggleActivo }: Props) {
  // Estilo solicitado: activado en tonos rojos (más intenso), desactivado en tonos verdes (atenuado)

  return (
    <div className={`relative card ${activo ? 'card--glow-red' : ''} hover:translate-y-[-1px]`}> 
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Circle className={`size-3 ${activo ? 'text-red-500' : 'text-emerald-500'}`} fill="currentColor" />
          <h3 className="text-lg font-semibold text-slate-950 truncate">{nombre}</h3>
        </div>
        {resumen.vencidos > 0 && (
          <div className="flex items-center gap-1 text-red-500 text-xs whitespace-nowrap">
            <TriangleAlert className="size-4" />
            {resumen.vencidos} vencido(s)
          </div>
        )}
      </div>
      <div className="mt-2 text-sm text-slate-800">{resumen.prestados} equipo(s) prestados — {activo ? 'activo' : 'inactivo'}</div>
      {prestados.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs">
          {prestados.map(code => (
            <li key={code} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 ring-1 ring-slate-200 w-fit font-mono tracking-wide">{code}</li>
          ))}
        </ul>
      )}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          className={`btn text-xs sm:text-sm ${activo ? 'btn-ice-red' : 'text-slate-700'}`}
          onClick={onToggleActivo}
        >
          {activo ? 'Activado' : 'Desactivado'}
        </button>
        <button className="btn-secondary text-xs sm:text-sm inline-flex items-center gap-1.5" onClick={onPrestar}>
          <Plus className="size-4" />
          <span>Prestar</span>
        </button>
        <button className="btn-secondary text-xs sm:text-sm inline-flex items-center gap-1.5" onClick={onDevolver}>
          <RotateCcw className="size-4" />
          <span>Recuperar</span>
        </button>
      </div>
    </div>
  )
}


