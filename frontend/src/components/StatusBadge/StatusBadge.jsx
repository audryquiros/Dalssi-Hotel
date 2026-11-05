import './StatusBadge.css';

const labels = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  en_curso: 'En curso',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
  activo: 'Activo',
  inactivo: 'Inactivo',
  disponible: 'Disponible',
  ocupada: 'Ocupada',
  mantenimiento: 'Mantenimiento',
  limpieza: 'Limpieza',
  confirmado: 'Confirmado',
  rechazado: 'Rechazado',
  anulado: 'Anulado',
  emitida: 'Emitida',
};

export default function StatusBadge({ value }) {
  const normalized = String(value || '').toLowerCase();
  return <span className={`status-badge status-${normalized}`}>{labels[normalized] || value || '—'}</span>;
}
