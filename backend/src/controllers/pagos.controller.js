import { models } from '../models/index.js';

const { pagos: Pago, reservaciones: Reservacion, clientes: Cliente, personas: Persona } = models;
const reservationInclude = { model: Reservacion, include: [{ model: Cliente, include: [{ model: Persona, as: 'persona' }] }] };

function paymentHasConfirmed(row) { return row && row.estado === 'confirmado'; }

export async function list(req, res, next) {
  try {
    const data = await Pago.findAll({ include: [reservationInclude], order: [['id_pago', 'ASC']] });
    res.json({ data });
  } catch (error) { next(error); }
}

export async function get(req, res, next) {
  try {
    const data = await Pago.findByPk(req.params.id, { include: [reservationInclude] });
    if (!data) return res.status(404).json({ message: 'Pago no encontrado.' });
    res.json({ data });
  } catch (error) { next(error); }
}

export async function create(req, res, next) {
  try {
    const { id_reservacion, fecha_pago, monto, metodo_pago, estado } = req.body;
    const reservation = await Reservacion.findByPk(id_reservacion);
    if (!reservation) return res.status(400).json({ message: 'La reservación indicada no existe.' });

    const existing = await Pago.findOne({ where: { id_reservacion } });
    if (existing) return res.status(409).json({ message: 'Esta reservación ya tiene un pago asociado.' });

    if (!monto || Number(monto) <= 0) return res.status(400).json({ message: 'El monto del pago debe ser mayor que cero.' });

    const payment = await Pago.create({
      id_reservacion,
      fecha_pago: fecha_pago || new Date(),
      monto,
      metodo_pago,
      estado: estado || 'confirmado',
    });

    const data = await Pago.findByPk(payment.id_pago, { include: [reservationInclude] });
    res.status(201).json({ message: paymentHasConfirmed(payment) ? 'Pago registrado correctamente. Ya puede emitirse la factura.' : 'Pago registrado correctamente.', data });
  } catch (error) { next(error); }
}

export async function update(req, res, next) {
  try {
    const payment = await Pago.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Pago no encontrado.' });

    const nextReservation = req.body.id_reservacion ?? payment.id_reservacion;
    if (Number(nextReservation) !== Number(payment.id_reservacion)) {
      const other = await Pago.findOne({ where: { id_reservacion: nextReservation } });
      if (other) return res.status(409).json({ message: 'La reservación seleccionada ya tiene un pago asociado.' });
    }

    await payment.update(req.body);
    const data = await Pago.findByPk(payment.id_pago, { include: [reservationInclude] });
    res.json({ message: 'Pago actualizado correctamente.', data });
  } catch (error) { next(error); }
}

export async function remove(req, res, next) {
  try {
    const payment = await Pago.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Pago no encontrado.' });
    await payment.destroy();
    res.json({ message: 'Pago eliminado correctamente.' });
  } catch (error) { next(error); }
}
