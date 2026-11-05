import sequelize from '../config/database.js';
import { Op } from 'sequelize';
import { models } from '../models/index.js';

const {
  reservaciones: Reservacion,
  detalle_reservacion: DetalleReservacion,
  habitaciones: Habitacion,
  tipos_habitacion: TipoHabitacion,
  reservacion_servicios: ReservacionServicio,
  servicios: Servicio,
  facturas: Factura,
  detalle_factura: DetalleFactura,
} = models;

const reservationInclude = [
  { model: DetalleReservacion, as: 'detalle_reservacion', include: [{ model: Habitacion, as: 'habitacion', include: [{ model: TipoHabitacion }] }] },
  { model: ReservacionServicio, as: 'reservacion_servicios', include: [{ model: Servicio, as: 'servicio' }] },
  { model: Factura, as: 'facturas', include: [{ model: DetalleFactura, as: 'detalle_factura' }] },
];

function canEditReservation(item) {
  if (!item) return false;
  if (['cancelada', 'finalizada', 'en_curso'].includes(item.estado)) return false;
  const today = new Date().toISOString().slice(0, 10);
  return String(item.fecha_entrada || '') >= today;
}

async function validateRoomAvailability(id_reservacion, id_habitacion, fecha_entrada, fecha_salida, transaction) {
  if (String(fecha_entrada) >= String(fecha_salida)) {
    throw Object.assign(new Error('La fecha de salida debe ser posterior a la fecha de entrada.'), { status: 400 });
  }
  const conflicts = await DetalleReservacion.findAll({
    where: { id_habitacion },
    include: [{
      model: Reservacion,
      as: 'reservacion',
      required: true,
      where: {
        id_reservacion: { [Op.ne]: id_reservacion },
        estado: { [Op.notIn]: ['cancelada', 'finalizada'] },
        fecha_entrada: { [Op.lt]: fecha_salida },
        fecha_salida: { [Op.gt]: fecha_entrada },
      },
    }],
    transaction,
  });
  if (conflicts.length) throw Object.assign(new Error('La habitación seleccionada no está disponible para esas fechas.'), { status: 409 });
}

export async function listReservations(req, res, next) {
  try {
    const data = await Reservacion.findAll({ where: { id_cliente: req.user.id_cliente }, include: reservationInclude, order: [['fecha_entrada', 'DESC']] });
    res.json({ data });
  } catch (error) { next(error); }
}

export async function getReservation(req, res, next) {
  try {
    const data = await Reservacion.findOne({ where: { id_reservacion: req.params.id, id_cliente: req.user.id_cliente }, include: reservationInclude });
    if (!data) return res.status(404).json({ message: 'Reservación no encontrada.' });
    res.json({ data, editable: canEditReservation(data) });
  } catch (error) { next(error); }
}

export async function updateReservation(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const item = await Reservacion.findOne({ where: { id_reservacion: req.params.id, id_cliente: req.user.id_cliente }, transaction });
    if (!item) throw Object.assign(new Error('Reservación no encontrada.'), { status: 404 });
    if (!canEditReservation(item)) throw Object.assign(new Error('Esta estadía ya no puede modificarse.'), { status: 409 });

    const nextEntry = req.body.fecha_entrada || item.fecha_entrada;
    const nextExit = req.body.fecha_salida || item.fecha_salida;
    const today = new Date().toISOString().slice(0, 10);
    if (String(nextEntry) < today) throw Object.assign(new Error('La fecha de entrada debe ser igual o posterior a hoy.'), { status: 400 });

    const detail = await DetalleReservacion.findOne({ where: { id_reservacion: item.id_reservacion }, transaction });
    const requestedRoom = req.body.id_habitacion ? Number(req.body.id_habitacion) : null;
    const nextRoom = requestedRoom || detail?.id_habitacion || null;
    if (nextRoom && (req.body.fecha_entrada || req.body.fecha_salida || requestedRoom)) {
      await validateRoomAvailability(item.id_reservacion, nextRoom, nextEntry, nextExit, transaction);
    }

    if (requestedRoom && detail && Number(requestedRoom) !== Number(detail.id_habitacion)) {
      const room = await Habitacion.findByPk(requestedRoom, { transaction });
      if (!room || ['mantenimiento', 'limpieza'].includes(room.estado)) throw Object.assign(new Error('La habitación seleccionada no está disponible.'), { status: 409 });
      const tipo = await TipoHabitacion.findByPk(room.id_tipo_habitacion, { transaction });
      if (!tipo) throw Object.assign(new Error('El tipo de habitación seleccionado no existe.'), { status: 400 });
      const previousRoom = await Habitacion.findByPk(detail.id_habitacion, { transaction });
      if (previousRoom && !['mantenimiento', 'limpieza'].includes(previousRoom.estado)) await previousRoom.update({ estado: 'disponible' }, { transaction });
      await detail.update({ id_habitacion: requestedRoom, precio_noche: Number(tipo.precio_base || 0) }, { transaction });
      if (!['mantenimiento', 'limpieza'].includes(room.estado)) await room.update({ estado: 'ocupada' }, { transaction });
    }

    await item.update({ fecha_entrada: nextEntry, fecha_salida: nextExit, observaciones: req.body.observaciones ?? item.observaciones }, { transaction });
    await transaction.commit();

    const data = await Reservacion.findOne({ where: { id_reservacion: item.id_reservacion, id_cliente: req.user.id_cliente }, include: reservationInclude });
    res.json({ message: 'Tu estadía se actualizó correctamente.', data, editable: canEditReservation(data) });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function getInvoice(req, res, next) {
  try {
    const reservation = await Reservacion.findOne({ where: { id_reservacion: req.params.id, id_cliente: req.user.id_cliente }, attributes: ['id_reservacion'] });
    if (!reservation) return res.status(404).json({ message: 'Reservación no encontrada.' });

    const data = await Factura.findOne({
      where: { id_reservacion: reservation.id_reservacion },
      include: [{ model: DetalleFactura, as: 'detalle_factura' }],
      order: [['id_factura', 'DESC']],
    });
    if (!data) return res.status(404).json({ message: 'Esta estadía todavía no tiene una factura disponible.' });
    res.json({ data });
  } catch (error) { next(error); }
}
