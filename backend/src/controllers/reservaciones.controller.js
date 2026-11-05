import sequelize from '../config/database.js';
import { Op } from 'sequelize';
import { models } from '../models/index.js';
import { getReservationBillingSummary } from '../utils/billing.js';

const { reservaciones: Reservacion, clientes: Cliente, empleados: Empleado, personas: Persona, detalle_reservacion: DetalleReservacion, habitaciones: Habitacion, reservacion_servicios: ReservacionServicio, servicios: Servicio } = models;

const include = [
  { model: Cliente, as: 'cliente', include: [{ model: Persona, as: 'persona' }] },
  { model: Empleado, as: 'empleado', include: [{ model: Persona, as: 'persona' }] },
  { model: DetalleReservacion, as: 'detalle_reservacion', include: [{ model: Habitacion, as: 'habitacion' }] },
  { model: ReservacionServicio, as: 'reservacion_servicios', include: [{ model: Servicio, as: 'servicio' }] },
];

export async function list(req, res, next) {
  try {
    const data = await Reservacion.findAll({ include, order: [['id_reservacion', 'ASC']] });
    res.json({ data });
  } catch (error) { next(error); }
}

export async function get(req, res, next) {
  try {
    const data = await Reservacion.findByPk(req.params.id, { include });
    if (!data) return res.status(404).json({ message: 'Reservación no encontrada.' });
    res.json({ data });
  } catch (error) { next(error); }
}

export async function create(req, res, next) {
  try {
    const data = await Reservacion.create(req.body);
    const result = await Reservacion.findByPk(data.id_reservacion, { include });
    res.status(201).json({ message: 'Reservación creada correctamente.', data: result });
  } catch (error) { next(error); }
}

async function validateRoomAvailability(id_reservacion, id_habitacion, fecha_entrada, fecha_salida, transaction) {
  if (!id_habitacion || !fecha_entrada || !fecha_salida) return;
  if (String(fecha_entrada) >= String(fecha_salida)) {
    throw Object.assign(new Error('La fecha de salida debe ser posterior a la fecha de entrada.'), { status: 400 });
  }
  const existing = await DetalleReservacion.findOne({
    where: { id_reservacion: id_reservacion, id_habitacion },
    transaction,
  });
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
  if (conflicts.length) {
    throw Object.assign(new Error('La habitación seleccionada no está disponible para esas fechas.'), { status: 409 });
  }
  return existing;
}

export async function update(req, res, next) {
  try {
    const item = await Reservacion.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Reservación no encontrada.' });

    const nextEntry = req.body.fecha_entrada || item.fecha_entrada;
    const nextExit = req.body.fecha_salida || item.fecha_salida;
    const detail = await DetalleReservacion.findOne({ where: { id_reservacion: item.id_reservacion } });
    if (detail && (req.body.fecha_entrada || req.body.fecha_salida)) {
      await validateRoomAvailability(item.id_reservacion, detail.id_habitacion, nextEntry, nextExit);
    }

    await item.update(req.body);

    if (req.body.estado && ['cancelada', 'finalizada'].includes(req.body.estado)) {
      const details = await DetalleReservacion.findAll({ where: { id_reservacion: item.id_reservacion } });
      for (const detail of details) {
        const room = await Habitacion.findByPk(detail.id_habitacion);
        if (room && !['mantenimiento', 'limpieza'].includes(room.estado)) {
          await room.update({ estado: 'disponible' });
        }
      }
    }

    const data = await Reservacion.findByPk(item.id_reservacion, { include });
    res.json({ message: 'Reservación actualizada correctamente.', data });
  } catch (error) { next(error); }
}

export async function remove(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const item = await Reservacion.findByPk(req.params.id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Reservación no encontrada.' });
    }

    const details = await DetalleReservacion.findAll({ where: { id_reservacion: item.id_reservacion }, transaction });
    for (const detail of details) {
      const room = await Habitacion.findByPk(detail.id_habitacion, { transaction });
      if (room && !['mantenimiento', 'limpieza'].includes(room.estado)) {
        await room.update({ estado: 'disponible' }, { transaction });
      }
    }

    await item.destroy({ transaction });
    await transaction.commit();
    res.json({ message: 'Reservación eliminada correctamente.' });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function replaceRoom(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const reservation = await Reservacion.findByPk(req.params.id, { transaction });
    if (!reservation) throw Object.assign(new Error('Reservación no encontrada.'), { status: 404 });

    const id_habitacion = Number(req.body.id_habitacion || 0);
    if (!id_habitacion) throw Object.assign(new Error('Debe seleccionar una habitación.'), { status: 400 });

    const room = await Habitacion.findByPk(id_habitacion, { transaction });
    if (!room) throw Object.assign(new Error('La habitación seleccionada no existe.'), { status: 404 });
    if (['mantenimiento', 'limpieza'].includes(room.estado)) {
      throw Object.assign(new Error('La habitación seleccionada no está disponible actualmente.'), { status: 409 });
    }

    await validateRoomAvailability(reservation.id_reservacion, id_habitacion, reservation.fecha_entrada, reservation.fecha_salida, transaction);

    const tipo = await models.tipos_habitacion.findByPk(room.id_tipo_habitacion, { transaction });
    if (!tipo) throw Object.assign(new Error('El tipo de habitación seleccionado no existe.'), { status: 400 });

    const previousDetail = await DetalleReservacion.findOne({
      where: { id_reservacion: reservation.id_reservacion },
      transaction,
    });

    if (previousDetail && Number(previousDetail.id_habitacion) !== Number(room.id_habitacion)) {
      const previousRoom = await Habitacion.findByPk(previousDetail.id_habitacion, { transaction });
      if (previousRoom && !['mantenimiento', 'limpieza'].includes(previousRoom.estado)) {
        await previousRoom.update({ estado: 'disponible' }, { transaction });
      }
    }

    await DetalleReservacion.destroy({ where: { id_reservacion: reservation.id_reservacion }, transaction });
    await DetalleReservacion.create({
      id_reservacion: reservation.id_reservacion,
      id_habitacion: room.id_habitacion,
      precio_noche: Number(tipo.precio_base || 0),
    }, { transaction });

    if (!['cancelada', 'finalizada'].includes(reservation.estado) && !['mantenimiento', 'limpieza'].includes(room.estado)) {
      await room.update({ estado: 'ocupada' }, { transaction });
    }

    await transaction.commit();
    const data = await Reservacion.findByPk(reservation.id_reservacion, { include });
    res.json({ message: 'Habitación de la reservación actualizada correctamente.', data });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function summary(req, res, next) {
  try {
    const data = await getReservationBillingSummary(req.params.id);
    res.json({ data });
  } catch (error) { next(error); }
}

export async function replaceServices(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const reservation = await Reservacion.findByPk(req.params.id, { transaction });
    if (!reservation) throw Object.assign(new Error('Reservación no encontrada.'), { status: 404 });

    const services = Array.isArray(req.body.services) ? req.body.services : [];
    const serviceIds = services.map(item => Number(item.id_servicio)).filter(Boolean);
    const catalog = serviceIds.length ? await Servicio.findAll({ where: { id_servicio: serviceIds }, transaction }) : [];
    const catalogMap = new Map(catalog.map(item => [item.id_servicio, item]));

    for (const item of services) {
      const id_servicio = Number(item.id_servicio);
      const service = catalogMap.get(id_servicio);
      if (!service) throw Object.assign(new Error(`El servicio #${id_servicio} no existe.`), { status: 400 });
      if (service.estado === 'inactivo') throw Object.assign(new Error(`El servicio "${service.nombre}" está inactivo.`), { status: 400 });
      const cantidad = Number(item.cantidad || 1);
      if (!Number.isInteger(cantidad) || cantidad <= 0) throw Object.assign(new Error('La cantidad de cada servicio debe ser un entero mayor que cero.'), { status: 400 });
    }

    await ReservacionServicio.destroy({ where: { id_reservacion: reservation.id_reservacion }, transaction });

    if (services.length) {
      await ReservacionServicio.bulkCreate(services.map(item => {
        const service = catalogMap.get(Number(item.id_servicio));
        const cantidad = Number(item.cantidad || 1);
        const precio_unitario = Number(service.precio || 0);
        return {
          id_reservacion: reservation.id_reservacion,
          id_servicio: service.id_servicio,
          fecha_servicio: item.fecha_servicio || new Date(),
          cantidad,
          precio_unitario,
          subtotal: Math.round(precio_unitario * cantidad * 100) / 100,
        };
      }), { transaction });
    }

    await transaction.commit();
    const data = await Reservacion.findByPk(reservation.id_reservacion, { include });
    res.json({ message: 'Servicios de la reservación actualizados correctamente.', data });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}
