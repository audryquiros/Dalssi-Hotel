import { models } from '../models/index.js';

export async function summary(req, res, next) {
  try {
    const [reservaciones, habitaciones, huespedes, pagos] = await Promise.all([
      models.reservaciones.findAll({
        attributes: ['id_reservacion', 'id_cliente', 'estado', 'fecha_entrada', 'fecha_salida'],
        include: [
          { model: models.clientes, as: 'cliente', include: [{ model: models.personas, as: 'persona' }] },
          { model: models.detalle_reservacion, as: 'detalle_reservacion', include: [{ model: models.habitaciones, as: 'habitacion' }] },
        ],
      }),
      models.habitaciones.findAll({ attributes: ['id_habitacion', 'estado'] }),
      models.huespedes.count(),
      models.pagos.findAll({ attributes: ['monto', 'fecha_pago'] }),
    ]);

    const activeReservations = reservaciones.filter((r) => ['pendiente', 'confirmada', 'en_curso'].includes(r.estado)).length;
    const occupiedRooms = habitaciones.filter((r) => r.estado === 'ocupada').length;
    const roomTotal = habitaciones.length;
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const monthlyIncome = pagos.reduce((sum, payment) => {
      const date = payment.fecha_pago ? new Date(payment.fecha_pago) : null;
      if (!date || date.getMonth() !== month || date.getFullYear() !== year) return sum;
      return sum + Number(payment.monto || 0);
    }, 0);

    const upcoming = reservaciones
      .filter((r) => ['pendiente', 'confirmada', 'en_curso'].includes(r.estado))
      .sort((a, b) => String(a.fecha_entrada).localeCompare(String(b.fecha_entrada)))
      .slice(0, 5)
      .map((r) => ({
        id_reservacion: r.id_reservacion,
        estado: r.estado,
        fecha_entrada: r.fecha_entrada,
        fecha_salida: r.fecha_salida,
        cliente: r.cliente?.persona ? `${r.cliente.persona.nombre || ''} ${r.cliente.persona.apellidos || ''}`.trim() : `Cliente #${r.id_cliente}`,
        habitacion: r.detalle_reservacion?.[0]?.habitacion?.numero || 'Sin habitación asignada',
      }));

    res.json({
      data: {
        activeReservations,
        occupiedRooms,
        roomTotal,
        occupancyRate: roomTotal ? Math.round((occupiedRooms / roomTotal) * 100) : 0,
        guests: huespedes,
        monthlyIncome,
        upcoming,
      },
    });
  } catch (error) { next(error); }
}
