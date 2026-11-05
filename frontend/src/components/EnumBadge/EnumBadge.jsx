import './EnumBadge.css';

const labels = {
  activo: 'Activo', inactivo: 'Inactivo', disponible: 'Disponible', ocupada: 'Ocupada', mantenimiento: 'Mantenimiento', limpieza: 'Limpieza',
  pendiente: 'Pendiente', confirmada: 'Confirmada', en_curso: 'En curso', finalizada: 'Finalizada', cancelada: 'Cancelada',
  confirmado: 'Confirmado', rechazado: 'Rechazado', anulado: 'Anulado', emitida: 'Emitida', anulada: 'Anulada',
  sinpe: 'SINPE', transferencia: 'Transferencia', tarjeta: 'Tarjeta', efectivo: 'Efectivo'
};
const tone = (field, value) => {
  const key = String(value || '').toLowerCase();
  if (field === 'metodo_pago') return { sinpe:'purple', transferencia:'blue', tarjeta:'sky', efectivo:'green' }[key] || 'neutral';
  return { activo:'green', disponible:'green', confirmada:'green', confirmado:'green', emitida:'green', inactivo:'neutral', pendiente:'gold', en_curso:'blue', ocupada:'blue', finalizada:'neutral', mantenimiento:'orange', limpieza:'purple', cancelada:'red', rechazado:'red', anulado:'red', anulada:'red' }[key] || 'neutral';
};
export default function EnumBadge({ field, value }) {
  if (value === null || value === undefined || value === '') return <span>—</span>;
  return <span className={`enum-badge ${tone(field, value)}`}>{labels[String(value).toLowerCase()] || String(value)}</span>;
}
