export async function up(queryInterface) {
  const [columns] = await queryInterface.sequelize.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'empleados'`
  );

  const existing = new Set(columns.map(row => row.COLUMN_NAME));
  const duplicatedFields = [
    'identificacion',
    'nombre',
    'apellidos',
    'telefono',
    'correo',
  ].filter(column => existing.has(column));

  if (!duplicatedFields.length) {
    console.log('La tabla empleados ya está limpia.');
    return;
  }

  // Evita eliminar información si todavía existe algún dato en los campos antiguos.
  const [rows] = await queryInterface.sequelize.query(
    `SELECT COUNT(*) AS total
     FROM empleados
     WHERE identificacion IS NOT NULL
        OR nombre IS NOT NULL
        OR apellidos IS NOT NULL
        OR telefono IS NOT NULL
        OR correo IS NOT NULL`
  );

  if (Number(rows[0]?.total || 0) > 0) {
    throw new Error(
      'No se pueden eliminar los campos personales antiguos de empleados porque todavía contienen datos. '
      + 'Trasladá esos datos a personas antes de ejecutar esta migración.'
    );
  }

  for (const column of duplicatedFields) {
    await queryInterface.removeColumn('empleados', column);
  }

  console.log('Campos personales duplicados eliminados de empleados.');
}

export async function down(queryInterface, Sequelize) {
  const [columns] = await queryInterface.sequelize.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'empleados'`
  );

  const existing = new Set(columns.map(row => row.COLUMN_NAME));
  const fields = {
    identificacion: Sequelize.STRING(15),
    nombre: Sequelize.STRING(50),
    apellidos: Sequelize.STRING(60),
    telefono: Sequelize.STRING(30),
    correo: Sequelize.STRING(100),
  };

  for (const [column, type] of Object.entries(fields)) {
    if (!existing.has(column)) {
      await queryInterface.addColumn('empleados', column, {
        type,
        allowNull: true,
      });
    }
  }
}
