import type { Prestamo } from '../types/firebase'

export function validateUniqueCode(code: string): boolean {
  return /^[A-Z]{3,5}-?[A-Z]?\d{3}$/i.test(code.trim())
}

export function validateLoanData(prestamo: Partial<Prestamo>): string[] {
  const errors: string[] = []
  if (!prestamo.lugarId) errors.push('Lugar es obligatorio')
  if (!prestamo.equipoId) errors.push('Equipo es obligatorio')
  if (!prestamo.responsable) errors.push('Responsable es obligatorio')
  if (!prestamo.fechaPrestamo) errors.push('Fecha de préstamo es obligatoria')
  return errors
}


