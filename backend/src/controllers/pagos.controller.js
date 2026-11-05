import sequelize from '../config/database.js';
import { models } from '../models/index.js';
import { getReservationBillingSummary, createInvoiceForReservation } from '../utils/billing.js';

const { pagos: Pago, reservaciones: Reservacion, clientes: Cliente, personas: Persona, facturas: Factura } = models;
const reservationInclude = {
  model: Reservacion,
  as: 'reservacion',
  include: [
    { model: Cliente, as: 'cliente', include: [{ model: Persona, as: 'persona' }] },
  ],
};

function paymentHasConfirmed(row) { return row && row.estado === 'confirmado'; }

export async function list(req, res, next) {
  try {
    const data = await Pago.findAll({ include: [reservationInclude], order: [['id_pago', 'ASC']] });
    const enriched = await Promise.all(data.map(async row => {
      const json = row.toJSON();
      try {
        const summary = await getReservationBillingSummary(row.id_reservacion);
        json.desglose = summary;
        const invoice = await Factura.findOne({ where: { id_reservacion: row.id_reservacion, estado: 'emitida' } });
        json.facturable = false;
        json.factura_generada = Boolean(invoice);
      } catch (_) {
        json.facturable = false;
      }
      return json;
    }));
    res.json({ data: enriched });
  } catch (error) { next(error); }
}

export async function get(req, res, next) {
  try {
    const data = await Pago.findByPk(req.params.id, { include: [reservationInclude] });
    if (!data) return res.status(404).json({ message: 'Pago no encontrado.' });
    const json = data.toJSON();
    json.desglose = await getReservationBillingSummary(data.id_reservacion);
    json.facturable = paymentHasConfirmed(data) && !(await Factura.findOne({ where: { id_reservacion: data.id_reservacion, estado: 'emitida' } }));
    res.json({ data: json });
  } catch (error) { next(error); }
}

export async function availableReservations(req, res, next) {
  try {
    const reservations = await Reservacion.findAll({
      include: [
        { model: Cliente, as: 'cliente', required: true, include: [{ model: Persona, as: 'persona', required: true }] },
        { model: Pago, as: 'pagos', required: false },
      ],
      order: [['fecha_entrada', 'ASC'], ['id_reservacion', 'ASC']],
    });
    const data = reservations
      .filter(row => row.estado !== 'cancelada' && row.cliente?.estado !== 'inactivo' && row.cliente?.persona?.estado !== 'inactivo' && !(row.pagos || []).some(payment => ['pendiente', 'confirmado'].includes(payment.estado)))
      .map(row => ({
        id_reservacion: row.id_reservacion,
        fecha_entrada: row.fecha_entrada,
        fecha_salida: row.fecha_salida,
        estado: row.estado,
        cliente_nombre: `${row.cliente?.persona?.nombre || ''} ${row.cliente?.persona?.apellidos || ''}`.trim() || `Cliente #${row.id_cliente}`,
      }));
    res.json({ data });
  } catch (error) { next(error); }
}

export async function reservationSummary(req, res, next) {
  try {
    const data = await getReservationBillingSummary(req.params.id);
    res.json({ data });
  } catch (error) { next(error); }
}

export async function create(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { id_reservacion, fecha_pago, metodo_pago, estado = 'confirmado' } = req.body;
    if (!id_reservacion) throw Object.assign(new Error('Debe seleccionar una reservación.'), { status: 400 });
    const reservation = await Reservacion.findByPk(id_reservacion, { transaction });
    if (!reservation) throw Object.assign(new Error('La reservación indicada no existe.'), { status: 400 });
    const existing = await Pago.findOne({
      where: { id_reservacion, estado: ['pendiente', 'confirmado'] },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (existing) throw Object.assign(new Error('Esta reservación ya tiene un pago activo asociado.'), { status: 409 });
    if (reservation.estado === 'cancelada') throw Object.assign(new Error('No se puede registrar un pago para una reservación cancelada.'), { status: 400 });

    const summary = await getReservationBillingSummary(id_reservacion, transaction);
    const requestedAmount = req.body.monto == null || req.body.monto === '' ? summary.total : Number(req.body.monto);
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) return res.status(400).json({ message: 'El monto del pago debe ser mayor que cero.' });
    if (Math.abs(requestedAmount - summary.total) > 0.01) {
      return res.status(400).json({ message: `El monto debe coincidir con el total de la reservación: ₡${summary.total.toLocaleString('es-CR', { minimumFractionDigits: 2 })}.` });
    }

    const payment = await Pago.create({
      id_reservacion,
      fecha_pago: fecha_pago || new Date(),
      monto: summary.total,
      metodo_pago,
      estado,
    }, { transaction });

    let invoice = null;
    if (paymentHasConfirmed(payment)) invoice = await createInvoiceForReservation(id_reservacion, transaction);

    await transaction.commit();
    const data = await Pago.findByPk(payment.id_pago, { include: [reservationInclude] });
    const json = data.toJSON();
    json.desglose = await getReservationBillingSummary(payment.id_reservacion);
    json.facturable = false;
    json.factura_generada = Boolean(invoice);
    res.status(201).json({ message: invoice ? 'Pago registrado correctamente. Factura generada automáticamente.' : 'Pago registrado correctamente.', data: json });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function update(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const payment = await Pago.findByPk(req.params.id, { transaction });
    if (!payment) throw Object.assign(new Error('Pago no encontrado.'), { status: 404 });

    const previousState = payment.estado;
    if (previousState === 'anulado') {
      throw Object.assign(new Error('Un pago anulado no se puede editar ni reactivar.'), { status: 409 });
    }
    const nextState = req.body.estado ?? previousState;
    const nextReservation = req.body.id_reservacion ?? payment.id_reservacion;

    if (Number(nextReservation) !== Number(payment.id_reservacion)) {
      const other = await Pago.findOne({
        where: { id_reservacion: nextReservation, estado: ['pendiente', 'confirmado'] },
        transaction,
      });
      if (other) throw Object.assign(new Error('La reservación seleccionada ya tiene un pago activo asociado.'), { status: 409 });
    }

    const summary = await getReservationBillingSummary(nextReservation, transaction);
    const nextAmount = req.body.monto == null || req.body.monto === '' ? summary.total : Number(req.body.monto);
    if (Math.abs(nextAmount - summary.total) > 0.01) {
      throw Object.assign(new Error(`El monto debe coincidir con el total de la reservación: ₡${summary.total.toLocaleString('es-CR', { minimumFractionDigits: 2 })}.`), { status: 400 });
    }

    await payment.update({ ...req.body, id_reservacion: nextReservation, monto: summary.total }, { transaction });

    // Si el pago deja de estar confirmado, la factura emitida asociada deja de ser válida.
    // Se conserva como historial y podrá generarse otra al confirmar un nuevo pago.
    if (previousState === 'confirmado' && nextState !== 'confirmado') {
      await Factura.update(
        { estado: 'anulada' },
        { where: { id_reservacion: payment.id_reservacion, estado: 'emitida' }, transaction }
      );
    }

    let invoice = null;
    if (nextState === 'confirmado') {
      invoice = await createInvoiceForReservation(nextReservation, transaction);
    }

    await transaction.commit();
    const data = await Pago.findByPk(payment.id_pago, { include: [reservationInclude] });
    const json = data.toJSON();
    json.desglose = await getReservationBillingSummary(payment.id_reservacion);
    json.facturable = false;
    json.factura_generada = Boolean(invoice);
    res.json({
      message: invoice ? 'Pago actualizado correctamente. Factura generada automáticamente.' : 'Pago actualizado correctamente.',
      data: json,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const payment = await Pago.findByPk(req.params.id);
    if (!payment) throw Object.assign(new Error('Pago no encontrado.'), { status: 404 });
    if (payment.estado === 'anulado') {
      throw Object.assign(new Error('Un pago anulado no se puede eliminar. El registro se conserva como historial.'), { status: 409 });
    }
    const invoice = await Factura.findOne({ where: { id_reservacion: payment.id_reservacion } });
    if (invoice) throw Object.assign(new Error('Este pago está asociado a una factura y no se puede eliminar. El registro debe conservarse.'), { status: 409 });
    await payment.destroy();
    res.json({ message: 'Pago eliminado correctamente.' });
  } catch (error) { next(error); }
}
