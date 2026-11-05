export async function up(queryInterface, Sequelize) {
  const addEnumColumn = async (table, column) => {
    const [rows] = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${table}' AND COLUMN_NAME = '${column}'
    `);
    if (!rows.length) {
      await queryInterface.addColumn(table, column, {
        type: Sequelize.ENUM('activo', 'inactivo'),
        allowNull: false,
        defaultValue: 'activo',
      });
      await queryInterface.sequelize.query(`UPDATE ${table} SET ${column} = 'activo' WHERE ${column} IS NULL`);
    }
  };

  await addEnumColumn('personas', 'estado');
  await addEnumColumn('clientes', 'estado');
  await addEnumColumn('huespedes', 'estado');

  const addUnique = async (table, column, name) => {
    const [rows] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${table}' AND CONSTRAINT_TYPE = 'UNIQUE'
    `);
    const [indexes] = await queryInterface.sequelize.query(`SHOW INDEX FROM ${table} WHERE Column_name = '${column}' AND Non_unique = 0`);
    if (!rows.some(r => r.CONSTRAINT_NAME === name) && !indexes.length) {
      await queryInterface.addConstraint(table, { fields: [column], type: 'unique', name });
    }
  };

  await addUnique('pagos', 'id_reservacion', 'uq_pagos_reservacion');
  await addUnique('facturas', 'id_reservacion', 'uq_facturas_reservacion');

  // Los datos de prueba anteriores podían contener una factura para una reservación sin pago confirmado.
  // Se conserva el registro, pero se marca como anulada para que no se trate como una factura válida.
  await queryInterface.sequelize.query(`
    UPDATE facturas f
    LEFT JOIN pagos p ON p.id_reservacion = f.id_reservacion AND p.estado = 'confirmado'
    SET f.estado = 'anulada'
    WHERE p.id_pago IS NULL AND f.estado = 'emitida'
  `);
}

export async function down(queryInterface) {
  const removeUnique = async (table, name) => {
    try { await queryInterface.removeConstraint(table, name); } catch (_) {}
  };
  await removeUnique('pagos', 'uq_pagos_reservacion');
  await removeUnique('facturas', 'uq_facturas_reservacion');
  for (const [table, column] of [['personas','estado'],['clientes','estado'],['huespedes','estado']]) {
    try { await queryInterface.removeColumn(table, column); } catch (_) {}
  }
}
