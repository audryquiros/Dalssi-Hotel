import './EnumBadge.css';

const ENUM_LABELS = {
  activo: 'Activo', inactivo: 'Inactivo', disponible: 'Disponible', ocupada: 'Ocupada',
  mantenimiento: 'Mantenimiento', limpieza: 'Limpieza', pendiente: 'Pendiente',
  confirmada: 'Confirmada', en_curso: 'En curso', finalizada: 'Finalizada', cancelada: 'Cancelada',
  confirmado: 'Confirmado', rechazado: 'Rechazado', anulado: 'Anulado', emitida: 'Emitida',
  sinpe: 'SINPE', transferencia: 'Transferencia', tarjeta: 'Tarjeta', efectivo: 'Efectivo',
};

export const enumLabel = (value) => ENUM_LABELS[String(value).toLowerCase()] || String(value ?? '—');

export default function EnumBadge({ value }) {
  if (value === null || value === undefined || value === '') return <span>—</span>;
  const key = String(value).toLowerCase();
  return <span className={`enum-badge enum-${key.replaceAll('_', '-')}`}>{enumLabel(value)}</span>;
}
