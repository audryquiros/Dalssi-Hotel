import { models } from '../models/index.js';

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

export async function update(req, res, next) {
  try {
    const item = await Reservacion.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Reservación no encontrada.' });
    await item.update(req.body);
    const data = await Reservacion.findByPk(item.id_reservacion, { include });
    res.json({ message: 'Reservación actualizada correctamente.', data });
  } catch (error) { next(error); }
}

export async function remove(req, res, next) {
  try {
    const item = await Reservacion.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Reservación no encontrada.' });
    await item.destroy();
    res.json({ message: 'Reservación eliminada correctamente.' });
  } catch (error) { next(error); }
}
