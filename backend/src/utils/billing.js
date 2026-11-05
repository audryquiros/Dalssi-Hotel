import { models } from '../models/index.js';

const {
  reservaciones: Reservacion,
  clientes: Cliente,
  personas: Persona,
  detalle_reservacion: DetalleReservacion,
  habitaciones: Habitacion,
  tipos_habitacion: TipoHabitacionModel,
  reservacion_servicios: ReservacionServicio,
  servicios: Servicio,
} = models;

export const DEFAULT_TAX_RATE = 13;

export function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function calculateTotals(subtotal, taxRate = DEFAULT_TAX_RATE) {
  const base = roundMoney(subtotal);
  const rate = Number(taxRate);
  if (!Number.isFinite(base) || base < 0) {
    throw Object.assign(new Error('El subtotal debe ser un monto válido mayor o igual a cero.'), { status: 400 });
  }
  if (rate !== 13) {
    throw Object.assign(new Error('La tasa de impuesto de Dalssi es fija en 13%.'), { status: 400 });
  }
  const impuestos = roundMoney(base * 0.13);
  return { subtotal: base, porcentaje_impuesto: 13, impuestos, total: roundMoney(base + impuestos) };
}

export function formatClient(client) {
  const person = client?.persona;
  return `${person?.nombre || ''} ${person?.apellidos || ''}`.trim() || `Cliente #${client?.id_cliente || '—'}`;
}

export async function getReservationBillingSummary(id_reservacion, transaction) {
  const reservation = await Reservacion.findByPk(id_reservacion, {
    include: [
      { model: Cliente, as: 'cliente', include: [{ model: Persona, as: 'persona' }] },
      { model: DetalleReservacion, include: [{ model: Habitacion, as: 'habitacion', include: [{ model: TipoHabitacionModel }]}] },
      { model: ReservacionServicio, include: [{ model: Servicio, as: 'servicio' }] },
    ],
    transaction,
  });

  if (!reservation) {
    throw Object.assign(new Error('La reservación indicada no existe.'), { status: 400 });
  }

  const start = new Date(`${reservation.fecha_entrada}T00:00:00`);
  const end = new Date(`${reservation.fecha_salida}T00:00:00`);
  const nights = Math.max(1, Math.ceil((end - start) / 86400000));

  const rooms = (reservation.detalle_reservacion || []).map(detail => ({
    id_detalle_reservacion: detail.id_detalle_reservacion,
    descripcion: `Habitación ${detail.habitacion?.numero || '—'}${detail.habitacion?.tipos_habitacion?.nombre ? ` · ${detail.habitacion.tipo_habitacion.nombre}` : ''}`,
    cantidad: nights,
    precio_unitario: Number(detail.precio_noche || 0),
    subtotal: roundMoney(Number(detail.precio_noche || 0) * nights),
  }));

  const services = (reservation.reservacion_servicios || []).map(detail => ({
    id_reservacion_servicio: detail.id_reservacion_servicio,
    descripcion: detail.servicio?.nombre || `Servicio #${detail.id_servicio}`,
    cantidad: Number(detail.cantidad || 1),
    precio_unitario: Number(detail.precio_unitario || detail.servicio?.precio || 0),
    subtotal: roundMoney(Number(detail.subtotal || (Number(detail.precio_unitario || detail.servicio?.precio || 0) * Number(detail.cantidad || 1)))),
  }));

  const roomsSubtotal = rooms.reduce((sum, item) => sum + item.subtotal, 0);
  const servicesSubtotal = services.reduce((sum, item) => sum + item.subtotal, 0);
  const subtotal = roundMoney(roomsSubtotal + servicesSubtotal);
  const totals = calculateTotals(subtotal);

  return {
    reservation: reservation.toJSON(),
    cliente_nombre: formatClient(reservation.cliente),
    nights,
    rooms,
    services,
    roomsSubtotal: roundMoney(roomsSubtotal),
    servicesSubtotal: roundMoney(servicesSubtotal),
    ...totals,
  };
}
