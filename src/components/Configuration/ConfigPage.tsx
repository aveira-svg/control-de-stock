import { useEffect, useMemo, useState } from 'react'
import { addLugar, listenLugares } from '../../services/lugares'
import { ensureUniqueCodigo, createEquipo, listenEquipos, updateEquipo } from '../../services/equipos'
import { updateLugar } from '../../services/lugares'
import type { Lugar, Equipo, TipoEquipo, EstadoEquipo } from '../../types/firebase'
import { Timestamp } from 'firebase/firestore'

const tipos: TipoEquipo[] = ['camara_web','presentador','teclado_mouse','parlantes','pc','proyector']

export default function ConfigPage() {
  // Lugares
  const [lugares, setLugares] = useState<Lugar[]>([])
  const [nombreLugar, setNombreLugar] = useState('')
  const [descLugar, setDescLugar] = useState('')
  const [savingLugar, setSavingLugar] = useState(false)

  // Equipos
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<TipoEquipo>('proyector')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [estado, setEstado] = useState<EstadoEquipo>('disponible')
  const [checking, setChecking] = useState(false)
  const [isUnique, setIsUnique] = useState<boolean | null>(null)
  const [savingEquipo, setSavingEquipo] = useState(false)
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [editLugar, setEditLugar] = useState<Lugar | null>(null)
  const [editEquipo, setEditEquipo] = useState<Equipo | null>(null)

  useEffect(() => {
    const off1 = listenLugares(setLugares)
    const off2 = listenEquipos(setEquipos)
    return () => { off1(); off2() }
  }, [])

  async function onAddLugar(e: React.FormEvent) {
    e.preventDefault()
    if (!nombreLugar.trim()) return
    setSavingLugar(true)
    await addLugar(nombreLugar.trim(), descLugar.trim())
    setNombreLugar(''); setDescLugar(''); setSavingLugar(false)
  }

  useEffect(() => {
    let active = true
    async function run() {
      const code = codigo.trim().toUpperCase()
      if (!code) { setIsUnique(null); return }
      setChecking(true)
      const ok = await ensureUniqueCodigo(code)
      if (active) setIsUnique(ok)
      setChecking(false)
    }
    run()
    return () => { active = false }
  }, [codigo])

  const canSaveEquipo = useMemo(() => {
    return Boolean(codigo.trim() && nombre.trim() && isUnique)
  }, [codigo, nombre, isUnique])

  async function onAddEquipo(e: React.FormEvent) {
    e.preventDefault()
    if (!canSaveEquipo) return
    setSavingEquipo(true)
    const id = crypto.randomUUID()
    const now = Timestamp.now()
    await createEquipo(id, {
      codigoUnico: codigo.trim().toUpperCase(),
      nombre: nombre.trim(),
      tipo,
      marca: marca || undefined,
      modelo: modelo || undefined,
      numeroSerie: undefined,
      icono: tipo,
      estado,
      ubicacionActual: '',
      createdAt: now,
      updatedAt: now,
    } as unknown as Omit<Equipo,'id'>)
    setCodigo(''); setNombre(''); setMarca(''); setModelo(''); setEstado('disponible'); setTipo('proyector')
    setSavingEquipo(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="card">
        <h3 className="text-lg font-medium text-slate-950 mb-3">Lugares</h3>
        <form onSubmit={onAddLugar} className="space-y-3">
          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Nombre del lugar</label>
            <input className="bg-white ring-1 ring-slate-300 rounded px-3 py-2 text-base" value={nombreLugar} onChange={(e) => setNombreLugar(e.target.value)} placeholder="Aula A" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Descripción</label>
            <input className="bg-white ring-1 ring-slate-300 rounded px-3 py-2 text-base" value={descLugar} onChange={(e) => setDescLugar(e.target.value)} placeholder="Opcional" />
          </div>
          <button className="btn w-full sm:w-auto" disabled={savingLugar || !nombreLugar.trim()}>{savingLugar ? 'Guardando...' : 'Agregar lugar'}</button>
        </form>
        <div className="mt-4 text-sm text-slate-600">{lugares.length} lugar(es) registrados</div>
        <ul className="mt-2 space-y-1 max-h-60 overflow-y-auto text-sm">
          {lugares.map(l => (
            <li key={l.id} className="flex items-center justify-between gap-2">
              <span className="truncate">{l.nombre}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{l.activo ? 'activo' : 'inactivo'}</span>
                <button className="btn-secondary px-2 py-1 text-xs" onClick={() => setEditLugar(l)}>Editar</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3 className="text-lg font-medium text-slate-950 mb-3">Equipos</h3>
        <form onSubmit={onAddEquipo} className="space-y-3">
          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Código único</label>
            <input className="bg-white ring-1 ring-slate-300 rounded px-3 py-2 text-base" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="PROY001" />
            {checking && <span className="text-xs text-slate-500">Verificando...</span>}
            {isUnique === false && <span className="text-xs text-red-500">Código ya existente</span>}
            {isUnique === true && <span className="text-xs text-emerald-500">Disponible</span>}
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Nombre/marca</label>
            <input className="bg-white ring-1 ring-slate-300 rounded px-3 py-2 text-base" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Proyector Epson" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Tipo</label>
            <select className="bg-white ring-1 ring-slate-300 rounded px-3 py-2" value={tipo} onChange={(e) => setTipo(e.target.value as TipoEquipo)}>
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input className="bg-white ring-1 ring-slate-300 rounded px-3 py-2 text-base" value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Marca (opc.)" />
            <input className="bg-white ring-1 ring-slate-300 rounded px-3 py-2 text-base" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Modelo (opc.)" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-700">Estado</label>
            <select className="bg-white ring-1 ring-slate-300 rounded px-3 py-2" value={estado} onChange={(e) => setEstado(e.target.value as EstadoEquipo)}>
              <option value="disponible">Disponible</option>
              <option value="prestado">Prestado</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="dañado">Dañado</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>
          <button className="btn w-full sm:w-auto" disabled={savingEquipo || !canSaveEquipo}>{savingEquipo ? 'Guardando...' : 'Registrar equipo'}</button>
        </form>
        <div className="mt-4 text-sm text-slate-600">{equipos.length} equipo(s) registrados</div>
        <ul className="mt-2 space-y-1 max-h-60 overflow-y-auto text-sm">
          {equipos.map(e => (
            <li key={e.id} className="flex items-center justify-between gap-2">
              <span className="truncate">{e.codigoUnico} — {e.nombre}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{e.estado}</span>
                <button className="btn-secondary px-2 py-1 text-xs" onClick={() => setEditEquipo(e)}>Editar</button>
              </div>
            </li>
          ))}
        </ul>

      {editLugar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md card max-h-[85dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Editar lugar</h3>
              <button className="btn-secondary" onClick={() => setEditLugar(null)}>Cerrar</button>
            </div>
            <LugarEditor lugar={editLugar} onSave={async (patch) => { await updateLugar(editLugar.id, patch); setEditLugar(null) }} />
          </div>
        </div>
      )}

      {editEquipo && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md card max-h-[85dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Editar equipo</h3>
              <button className="btn-secondary" onClick={() => setEditEquipo(null)}>Cerrar</button>
            </div>
            <EquipoEditor equipo={editEquipo} onSave={async (patch) => { await updateEquipo(editEquipo.id, patch as any); setEditEquipo(null) }} />
          </div>
        </div>
      )}
      </section>
    </div>
  )
}

function LugarEditor({ lugar, onSave }: { lugar: Lugar; onSave: (patch: Partial<Lugar>) => void }) {
  const [nombre, setNombre] = useState(lugar.nombre)
  const [descripcion, setDescripcion] = useState(lugar.descripcion || '')
  const [activo, setActivo] = useState(!!lugar.activo)
  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSave({ nombre: nombre.trim(), descripcion: descripcion.trim(), activo }) }}>
      <div className="grid gap-2">
        <label className="text-sm text-slate-700">Nombre</label>
        <input className="bg-white ring-1 ring-slate-300 rounded px-3 py-2 text-base" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm text-slate-700">Descripción</label>
        <input className="bg-white ring-1 ring-slate-300 rounded px-3 py-2 text-base" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} /> Activo</label>
      <div className="grid grid-cols-2 gap-2">
        <button className="btn" type="submit">Guardar</button>
      </div>
    </form>
  )
}

function EquipoEditor({ equipo, onSave }: { equipo: Equipo; onSave: (patch: Partial<Equipo>) => void }) {
  const [nombre, setNombre] = useState(equipo.nombre)
  const [marca, setMarca] = useState(equipo.marca || '')
  const [modelo, setModelo] = useState(equipo.modelo || '')
  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSave({ nombre: nombre.trim(), marca: marca || undefined, modelo: modelo || undefined }) }}>
      <div className="grid gap-2">
        <label className="text-sm text-slate-700">Nombre</label>
        <input className="bg-white ring-1 ring-slate-300 rounded px-3 py-2 text-base" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input className="bg-white ring-1 ring-slate-300 rounded px-3 py-2 text-base" value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Marca (opc.)" />
        <input className="bg-white ring-1 ring-slate-300 rounded px-3 py-2 text-base" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Modelo (opc.)" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="btn" type="submit">Guardar</button>
      </div>
    </form>
  )
}


