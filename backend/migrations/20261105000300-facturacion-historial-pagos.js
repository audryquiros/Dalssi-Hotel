export async function up(queryInterface) {
  // Permite conservar pagos anulados/rechazados y registrar un nuevo pago confirmado
  // para la misma reservación cuando corresponda. Solo los estados activos se validan
  // desde el controlador.
  const [indexes] = await queryInterface.sequelize.query(
    `SHOW INDEX FROM pagos WHERE Column_name = 'id_reservacion' AND Non_unique = 0`
  );

  for (const index of indexes) {
    if (index.Key_name !== 'PRIMARY') {
      try { await queryInterface.removeIndex('pagos', index.Key_name); } catch (_) {}
    }
  }

  // Facturas: varias facturas históricas por reservación; solo una emitida se controla
  // desde el flujo de facturación.
  const [invoiceIndexes] = await queryInterface.sequelize.query(
    `SHOW INDEX FROM facturas WHERE Column_name = 'id_reservacion' AND Non_unique = 0`
  );
  for (const index of invoiceIndexes) {
    if (index.Key_name !== 'PRIMARY') {
      try { await queryInterface.removeIndex('facturas', index.Key_name); } catch (_) {}
    }
  }
}

export async function down(queryInterface) {
  await queryInterface.addIndex('pagos', ['id_reservacion'], { unique: true, name: 'uq_pagos_reservacion' });
  await queryInterface.addIndex('facturas', ['id_reservacion'], { unique: true, name: 'uq_facturas_reservacion' });
}
