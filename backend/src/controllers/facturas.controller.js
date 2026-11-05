import sequelize from '../config/database.js';
import { models } from '../models/index.js';

const {
  FacturasModel,
  DetalleFacturaModel,
  ReservacionesModel,
  ClientesModel,
  PersonasModel,
  DetalleReservacionModel,
  ReservacionServiciosModel,
} = {
  FacturasModel: models.facturas,
  DetalleFacturaModel: models.detalle_factura,
  ReservacionesModel: models.reservaciones,
  ClientesModel: models.clientes,
  PersonasModel: models.personas,
  DetalleReservacionModel: models.detalle_reservacion,
  ReservacionServiciosModel: models.reservacion_servicios,
};

export const TAX_OPTIONS = [0, 13];
const DEFAULT_TAX_RATE = 13;

const reservationInclude = [
  {
    model: ClientesModel,
    include: [{ model: PersonasModel, as: 'persona' }],
  },
];

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function calculateTotals(subtotal, taxRate = DEFAULT_TAX_RATE) {
  const base = roundMoney(subtotal);
  const rate = Number(taxRate);
  if (!Number.isFinite(base) || base < 0) {
    throw Object.assign(new Error('El subtotal debe ser un monto válido mayor o igual a cero.'), { status: 400 });
  }
  if (!TAX_OPTIONS.includes(rate)) {
    throw Object.assign(new Error('La tasa de impuesto seleccionada no es válida.'), { status: 400 });
  }
  const impuestos = roundMoney(base * (rate / 100));
  return {
    subtotal: base,
    porcentaje_impuesto: rate,
    impuestos,
    total: roundMoney(base + impuestos),
  };
}

function formatClient(client) {
  const person = client?.persona;
  return `${person?.nombre || ''} ${person?.apellidos || ''}`.trim() || `Cliente #${client?.id_cliente || '—'}`;
}

async function getReservationSubtotal(id_reservacion, transaction) {
  const reservation = await ReservacionesModel.findByPk(id_reservacion, {
    include: reservationInclude,
    transaction,
  });

  if (!reservation) {
    throw Object.assign(new Error('La reservación indicada no existe.'), { status: 400 });
  }

  const start = new Date(`${reservation.fecha_entrada}T00:00:00`);
  const end = new Date(`${reservation.fecha_salida}T00:00:00`);
  const nights = Math.max(1, Math.ceil((end - start) / 86400000));

  const roomDetails = await DetalleReservacionModel.findAll({
    where: { id_reservacion },
    transaction,
  });

  const serviceDetails = await ReservacionServiciosModel.findAll({
    where: { id_reservacion },
    transaction,
  });

  const roomsSubtotal = roomDetails.reduce(
    (sum, detail) => sum + Number(detail.precio_noche || 0) * nights,
    0
  );

  const servicesSubtotal = serviceDetails.reduce(
    (sum, detail) => sum + Number(detail.subtotal || 0),
    0
  );

  return {
    reservation,
    subtotal: roundMoney(roomsSubtotal + servicesSubtotal),
  };
}

function withDerivedRate(row) {
  const data = row.toJSON ? row.toJSON() : { ...row };
  const subtotal = Number(data.subtotal || 0);
  const impuestos = Number(data.impuestos || 0);
  data.porcentaje_impuesto = subtotal > 0
    ? roundMoney((impuestos / subtotal) * 100)
    : 0;

  if (data.reservacion?.cliente) {
    data.cliente_nombre = formatClient(data.reservacion.cliente);
  }

  return data;
}

export async function list(req, res, next) {
  try {
    const rows = await FacturasModel.findAll({
      include: [{
        model: ReservacionesModel,
        include: reservationInclude,
      }],
      order: [['id_factura', 'DESC']],
    });

    res.json({ data: rows.map(withDerivedRate) });
  } catch (error) {
    next(error);
  }
}

export async function get(req, res, next) {
  try {
    const row = await FacturasModel.findByPk(req.params.id, {
      include: [
        {
          model: ReservacionesModel,
          include: reservationInclude,
        },
        { model: DetalleFacturaModel, as: 'detalle_factura' },
      ],
    });

    if (!row) return res.status(404).json({ message: 'Factura no encontrada.' });

    res.json({ data: withDerivedRate(row) });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  const transaction = await sequelize.transaction();

  try {
    const {
      id_reservacion,
      porcentaje_impuesto = DEFAULT_TAX_RATE,
      fecha_emision,
    } = req.body;

    if (!id_reservacion) {
      throw Object.assign(new Error('Debe seleccionar una reservación.'), { status: 400 });
    }

    const existing = await FacturasModel.findOne({
      where: { id_reservacion },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existing) {
      throw Object.assign(
        new Error('La reservación ya tiene una factura asociada.'),
        { status: 409 }
      );
    }

    const { reservation, subtotal } = await getReservationSubtotal(
      id_reservacion,
      transaction
    );

    const totals = calculateTotals(subtotal, porcentaje_impuesto);

    const created = await FacturasModel.create({
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

    await transaction.commit();

    const data = withDerivedRate(created);
    data.reservacion = reservation.toJSON();
    data.cliente_nombre = formatClient(reservation.cliente);
    data.detalle_factura = [];

    res.status(201).json({
      message: 'Factura creada correctamente.',
      data,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function update(req, res, next) {
  return res.status(409).json({
    message: 'Las facturas emitidas no se editan. Se conservan para impresión y control de facturación.',
  });
}

export async function remove(req, res, next) {
  return res.status(409).json({
    message: 'Las facturas no se eliminan. Se conservan para impresión y control de facturación.',
  });
}

export async function calculate(req, res, next) {
  try {
    const { subtotal = 0, porcentaje_impuesto = DEFAULT_TAX_RATE } = req.body;
    res.json({ data: calculateTotals(subtotal, porcentaje_impuesto) });
  } catch (error) {
    next(error);
  }
}
