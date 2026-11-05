import sequelize from '../config/database.js';
import { models } from '../models/index.js';
import { calculateTotals, getReservationBillingSummary, formatClient } from '../utils/billing.js';

const {
  facturas: Factura,
  detalle_factura: DetalleFactura,
  reservaciones: Reservacion,
  clientes: Cliente,
  personas: Persona,
  pagos: Pago,
} = models;

const reservationInclude = [
  { model: Cliente, as: 'cliente', include: [{ model: Persona, as: 'persona' }] },
];

function withDerivedRate(row) {
  const data = row.toJSON ? row.toJSON() : { ...row };
  const subtotal = Number(data.subtotal || 0);
  const impuestos = Number(data.impuestos || 0);
  data.porcentaje_impuesto = subtotal > 0 ? Math.round((impuestos / subtotal) * 10000) / 100 : 0;
  if (data.reservacion?.cliente) data.cliente_nombre = formatClient(data.reservacion.cliente);
  return data;
}

function invoiceDetailsFromSummary(summary) {
  return [
    ...summary.rooms.map(item => ({
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal,
    })),
    ...summary.services.map(item => ({
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal,
    })),
  ];
}

export async function list(req, res, next) {
  try {
    const rows = await Factura.findAll({
      include: [{ model: Reservacion, as: 'reservacion', include: reservationInclude }],
      order: [['id_factura', 'DESC']],
    });
    res.json({ data: rows.map(withDerivedRate) });
  } catch (error) { next(error); }
}

export async function get(req, res, next) {
  try {
    const row = await Factura.findByPk(req.params.id, {
      include: [
        { model: Reservacion, as: 'reservacion', include: reservationInclude },
        { model: DetalleFactura, as: 'detalle_factura' },
      ],
    });
    if (!row) return res.status(404).json({ message: 'Factura no encontrada.' });
    const data = withDerivedRate(row);
    data.cliente_nombre = data.reservacion?.cliente ? formatClient(data.reservacion.cliente) : `Cliente #${data.reservacion?.id_cliente || '—'}`;
    // Las facturas antiguas pueden no tener detalle_factura persistido. Para no perder el desglose en pantalla/impresión,
    // se reconstruye desde la reservación usando las mismas reglas de facturación del backend.
    if (!data.detalle_factura?.length) {
      const summary = await getReservationBillingSummary(row.id_reservacion);
      data.detalle_factura = invoiceDetailsFromSummary(summary);
    }
    res.json({ data });
  } catch (error) { next(error); }
}

export async function availableReservations(req, res, next) {
  try {
    const rows = await Reservacion.findAll({
      include: [
        { model: Cliente, as: 'cliente', required: true, include: [{ model: Persona, as: 'persona', required: true }] },
        { model: Pago, as: 'pagos', required: false },
        { model: Factura, as: 'facturas', required: false },
      ],
      order: [['fecha_entrada', 'ASC'], ['id_reservacion', 'ASC']],
    });

    const data = rows
      .filter(row => row.estado !== 'cancelada')
      .filter(row => row.cliente?.estado !== 'inactivo' && row.cliente?.persona?.estado !== 'inactivo')
      .filter(row => (row.pagos || []).some(payment => payment.estado === 'confirmado'))
      // Una factura anulada no bloquea la generación de una nueva.
      .filter(row => !(row.facturas || []).some(invoice => invoice.estado === 'emitida'))
      .map(row => ({
        id_reservacion: row.id_reservacion,
        fecha_entrada: row.fecha_entrada,
        fecha_salida: row.fecha_salida,
        cliente_nombre: formatClient(row.cliente),
      }));

    res.json({ data });
  } catch (error) { next(error); }
}

export async function create(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { id_reservacion, fecha_emision } = req.body;
    if (!id_reservacion) throw Object.assign(new Error('Debe seleccionar una reservación.'), { status: 400 });

    const existing = await Factura.findOne({
      where: { id_reservacion, estado: 'emitida' },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (existing) throw Object.assign(new Error('La reservación ya tiene una factura emitida.'), { status: 409 });

    const payment = await Pago.findOne({ where: { id_reservacion, estado: 'confirmado' }, transaction });
    if (!payment) throw Object.assign(new Error('La reservación debe tener un pago confirmado antes de emitir la factura.'), { status: 400 });

    const summary = await getReservationBillingSummary(id_reservacion, transaction);
    const totals = calculateTotals(summary.subtotal);

    const created = await Factura.create({
      id_reservacion,
      numero_factura: null,
      fecha_emision: fecha_emision || new Date(),
      subtotal: totals.subtotal,
      impuestos: totals.impuestos,
      total: totals.total,
      estado: 'emitida',
    }, { transaction });

    const year = new Date(created.fecha_emision || new Date()).getFullYear();
    const numero_factura = `DAL-${year}-${String(created.id_factura).padStart(4, '0')}`;
    await created.update({ numero_factura }, { transaction });

    const details = invoiceDetailsFromSummary(summary).map(item => ({ id_factura: created.id_factura, ...item }));
    if (details.length) await DetalleFactura.bulkCreate(details, { transaction });

    await transaction.commit();
    const data = await Factura.findByPk(created.id_factura, {
      include: [
        { model: Reservacion, as: 'reservacion', include: reservationInclude },
        { model: DetalleFactura, as: 'detalle_factura' },
      ],
    });
    res.status(201).json({ message: 'Factura creada correctamente.', data: withDerivedRate(data) });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function update(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const invoice = await Factura.findByPk(req.params.id, { transaction });
    if (!invoice) throw Object.assign(new Error('Factura no encontrada.'), { status: 404 });

    const nextReservation = Number(req.body.id_reservacion || invoice.id_reservacion);
    const payment = await Pago.findOne({ where: { id_reservacion: nextReservation, estado: 'confirmado' }, transaction });
    if (!payment) throw Object.assign(new Error('La reservación seleccionada debe tener un pago confirmado.'), { status: 400 });

    if (nextReservation !== Number(invoice.id_reservacion)) {
      const other = await Factura.findOne({
        where: { id_reservacion: nextReservation, estado: 'emitida' },
        transaction,
      });
      if (other) throw Object.assign(new Error('La reservación seleccionada ya tiene una factura emitida.'), { status: 409 });
    }

    const summary = await getReservationBillingSummary(nextReservation, transaction);
    const totals = calculateTotals(summary.subtotal);
    await invoice.update({ id_reservacion: nextReservation, subtotal: totals.subtotal, impuestos: totals.impuestos, total: totals.total }, { transaction });
    await DetalleFactura.destroy({ where: { id_factura: invoice.id_factura }, transaction });
    const details = invoiceDetailsFromSummary(summary).map(item => ({ id_factura: invoice.id_factura, ...item }));
    if (details.length) await DetalleFactura.bulkCreate(details, { transaction });

    await transaction.commit();
    const data = await Factura.findByPk(invoice.id_factura, {
      include: [
        { model: Reservacion, as: 'reservacion', include: reservationInclude },
        { model: DetalleFactura, as: 'detalle_factura' },
      ],
    });
    res.json({ message: 'Factura actualizada correctamente.', data: withDerivedRate(data) });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function cancel(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const invoice = await Factura.findByPk(req.params.id, { transaction });
    if (!invoice) throw Object.assign(new Error('Factura no encontrada.'), { status: 404 });
    if (invoice.estado === 'anulada') throw Object.assign(new Error('La factura ya está anulada.'), { status: 409 });

    await invoice.update({ estado: 'anulada' }, { transaction });

    await transaction.commit();
    const data = await Factura.findByPk(invoice.id_factura, {
      include: [
        { model: Reservacion, as: 'reservacion', include: reservationInclude },
        { model: DetalleFactura, as: 'detalle_factura' },
      ],
    });
    res.json({ message: 'Factura anulada correctamente.', data: withDerivedRate(data) });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function remove(req, res, next) {
  return res.status(409).json({ message: 'Las facturas no se eliminan. Se conservan para impresión y control de facturación.' });
}

export async function calculate(req, res, next) {
  try {
    res.json({ data: calculateTotals(req.body.subtotal || 0) });
  } catch (error) { next(error); }
}
