import sequelize from '../config/database.js';
import { models } from '../models/index.js';

const { FacturasModel, DetalleFacturaModel, ReservacionesModel } = {
  FacturasModel: models.facturas,
  DetalleFacturaModel: models.detalle_factura,
  ReservacionesModel: models.reservaciones,
};

export const TAX_OPTIONS = [0, 13];
const DEFAULT_TAX_RATE = 13;

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function calculateTotals(subtotal, taxRate = DEFAULT_TAX_RATE) {
  const base = roundMoney(subtotal);
  const rate = Number(taxRate);
  if (!Number.isFinite(base) || base < 0) throw Object.assign(new Error('El subtotal debe ser un monto válido mayor o igual a cero.'), { status: 400 });
  if (!TAX_OPTIONS.includes(rate)) throw Object.assign(new Error('La tasa de impuesto seleccionada no es válida.'), { status: 400 });
  const impuestos = roundMoney(base * (rate / 100));
  return { subtotal: base, porcentaje_impuesto: rate, impuestos, total: roundMoney(base + impuestos) };
}

function normalizeDetails(details = []) {
  if (!Array.isArray(details)) throw Object.assign(new Error('El detalle de la factura debe ser una lista.'), { status: 400 });
  return details.filter(item => String(item.descripcion || '').trim() || Number(item.cantidad) || Number(item.precio_unitario)).map(item => {
    const cantidad = Number(item.cantidad);
    const precio_unitario = Number(item.precio_unitario);
    if (!Number.isInteger(cantidad) || cantidad <= 0) throw Object.assign(new Error('La cantidad de cada detalle debe ser un entero mayor a cero.'), { status: 400 });
    if (!Number.isFinite(precio_unitario) || precio_unitario < 0) throw Object.assign(new Error('El precio unitario de cada detalle no es válido.'), { status: 400 });
    return {
      descripcion: String(item.descripcion || '').trim(),
      cantidad,
      precio_unitario: roundMoney(precio_unitario),
      subtotal: roundMoney(cantidad * precio_unitario),
    };
  });
}

function withDerivedRate(row) {
  const data = row.toJSON ? row.toJSON() : { ...row };
  const subtotal = Number(data.subtotal || 0);
  const impuestos = Number(data.impuestos || 0);
  data.porcentaje_impuesto = subtotal > 0 ? roundMoney((impuestos / subtotal) * 100) : 0;
  return data;
}

export async function list(req, res, next) {
  try {
    const rows = await FacturasModel.findAll({ order: [['id_factura', 'DESC']] });
    res.json({ data: rows.map(withDerivedRate) });
  } catch (error) { next(error); }
}

export async function get(req, res, next) {
  try {
    const row = await FacturasModel.findByPk(req.params.id, { include: [{ model: DetalleFacturaModel, as: 'detalle_factura' }] });
    if (!row) return res.status(404).json({ message: 'Factura no encontrada.' });
    res.json({ data: withDerivedRate(row) });
  } catch (error) { next(error); }
}

export async function create(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { detalles = [], porcentaje_impuesto = DEFAULT_TAX_RATE, ...invoice } = req.body;
    if (!invoice.id_reservacion) throw Object.assign(new Error('Debe seleccionar una reservación.'), { status: 400 });
    const reservation = await ReservacionesModel.findByPk(invoice.id_reservacion, { transaction });
    if (!reservation) throw Object.assign(new Error('La reservación indicada no existe.'), { status: 400 });

    const normalizedDetails = normalizeDetails(detalles);
    const subtotal = normalizedDetails.length
      ? normalizedDetails.reduce((sum, item) => sum + item.subtotal, 0)
      : Number(invoice.subtotal || 0);
    const totals = calculateTotals(subtotal, porcentaje_impuesto);

    const created = await FacturasModel.create({
      id_reservacion: invoice.id_reservacion,
      numero_factura: invoice.numero_factura,
      fecha_emision: invoice.fecha_emision || new Date(),
      subtotal: totals.subtotal,
      impuestos: totals.impuestos,
      total: totals.total,
      estado: invoice.estado || 'emitida',
    }, { transaction });

    if (normalizedDetails.length) {
      await DetalleFacturaModel.bulkCreate(normalizedDetails.map(item => ({ ...item, id_factura: created.id_factura })), { transaction });
    }

    await transaction.commit();
    const data = withDerivedRate(created);
    data.detalle_factura = normalizedDetails;
    res.status(201).json({ message: 'Factura creada correctamente.', data });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function update(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const item = await FacturasModel.findByPk(req.params.id, { transaction });
    if (!item) { await transaction.rollback(); return res.status(404).json({ message: 'Factura no encontrada.' }); }

    const { detalles, porcentaje_impuesto, ...invoice } = req.body;
    const rate = porcentaje_impuesto === undefined ? (Number(item.subtotal) ? Number(item.impuestos) / Number(item.subtotal) * 100 : DEFAULT_TAX_RATE) : porcentaje_impuesto;
    let normalizedDetails;
    if (detalles !== undefined) normalizedDetails = normalizeDetails(detalles);
    const subtotal = normalizedDetails?.length
      ? normalizedDetails.reduce((sum, detail) => sum + detail.subtotal, 0)
      : (invoice.subtotal !== undefined ? Number(invoice.subtotal) : Number(item.subtotal || 0));
    const totals = calculateTotals(subtotal, rate);

    await item.update({
      id_reservacion: invoice.id_reservacion ?? item.id_reservacion,
      numero_factura: invoice.numero_factura ?? item.numero_factura,
      fecha_emision: invoice.fecha_emision ?? item.fecha_emision,
      subtotal: totals.subtotal,
      impuestos: totals.impuestos,
      total: totals.total,
      estado: invoice.estado ?? item.estado,
    }, { transaction });

    if (normalizedDetails) {
      await DetalleFacturaModel.destroy({ where: { id_factura: item.id_factura }, transaction });
      if (normalizedDetails.length) await DetalleFacturaModel.bulkCreate(normalizedDetails.map(detail => ({ ...detail, id_factura: item.id_factura })), { transaction });
    }

    await transaction.commit();
    const data = withDerivedRate(item);
    data.detalle_factura = normalizedDetails;
    res.json({ message: 'Factura actualizada correctamente.', data });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function remove(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const item = await FacturasModel.findByPk(req.params.id, { transaction });
    if (!item) { await transaction.rollback(); return res.status(404).json({ message: 'Factura no encontrada.' }); }
    await DetalleFacturaModel.destroy({ where: { id_factura: item.id_factura }, transaction });
    await item.destroy({ transaction });
    await transaction.commit();
    res.json({ message: 'Factura eliminada correctamente.' });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function calculate(req, res, next) {
  try {
    const { subtotal = 0, porcentaje_impuesto = DEFAULT_TAX_RATE } = req.body;
    res.json({ data: calculateTotals(subtotal, porcentaje_impuesto) });
  } catch (error) { next(error); }
}
