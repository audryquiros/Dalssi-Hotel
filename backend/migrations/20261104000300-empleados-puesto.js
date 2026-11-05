export async function up(queryInterface, Sequelize) {
  const [tables] = await queryInterface.sequelize.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'puesto'`
  );

  if (!tables.length) {
    await queryInterface.createTable('puesto', {
      id_puesto: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(60),
        allowNull: false,
        unique: true,
      },
    });
  }

  const [employeeColumns] = await queryInterface.sequelize.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'empleados'`
  );
  const columns = new Set(employeeColumns.map(row => row.COLUMN_NAME));

  if (!columns.has('id_puesto')) {
    await queryInterface.addColumn('empleados', 'id_puesto', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }

  // Migra los puestos existentes de la columna de texto a la tabla catálogo.
  if (columns.has('puesto')) {
    await queryInterface.sequelize.query(
      `INSERT INTO puesto (nombre)
       SELECT DISTINCT puesto
       FROM empleados
       WHERE puesto IS NOT NULL AND TRIM(puesto) <> ''
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)`
    );

    await queryInterface.sequelize.query(
      `UPDATE empleados e
       INNER JOIN puesto p ON p.nombre = e.puesto
       SET e.id_puesto = p.id_puesto
       WHERE e.puesto IS NOT NULL AND TRIM(e.puesto) <> ''`
    );

    const [missing] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) AS total FROM empleados WHERE id_puesto IS NULL`
    );
    if (Number(missing[0]?.total || 0) > 0) {
      throw new Error('No se puede completar la migración: existen empleados sin puesto asignado. Asigná un puesto antes de migrar.');
    }
  }

  await queryInterface.changeColumn('empleados', 'id_puesto', {
    type: Sequelize.INTEGER,
    allowNull: false,
  });

  const [constraints] = await queryInterface.sequelize.query(
    `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'empleados'
       AND COLUMN_NAME = 'id_puesto' AND REFERENCED_TABLE_NAME = 'puesto'`
  );

  if (!constraints.length) {
    await queryInterface.addConstraint('empleados', {
      fields: ['id_puesto'],
      type: 'foreign key',
      name: 'fk_empleados_puesto',
      references: { table: 'puesto', field: 'id_puesto' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  }

  if (columns.has('puesto')) {
    await queryInterface.removeColumn('empleados', 'puesto');
  }
}

export async function down(queryInterface, Sequelize) {
  const [employeeColumns] = await queryInterface.sequelize.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'empleados'`
  );
  const columns = new Set(employeeColumns.map(row => row.COLUMN_NAME));

  if (!columns.has('puesto')) {
    await queryInterface.addColumn('empleados', 'puesto', {
      type: Sequelize.STRING(60),
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      `UPDATE empleados e
       LEFT JOIN puesto p ON p.id_puesto = e.id_puesto
       SET e.puesto = p.nombre`
    );
  }

  const [constraints] = await queryInterface.sequelize.query(
    `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'empleados'
       AND COLUMN_NAME = 'id_puesto' AND REFERENCED_TABLE_NAME = 'puesto'`
  );

  if (constraints.length) {
    await queryInterface.removeConstraint('empleados', constraints[0].CONSTRAINT_NAME);
  }

  if (columns.has('id_puesto')) {
    await queryInterface.removeColumn('empleados', 'id_puesto');
  }

  const [tables] = await queryInterface.sequelize.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'puesto'`
  );
  if (tables.length) await queryInterface.dropTable('puesto');
}
