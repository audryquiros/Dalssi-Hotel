export async function up(queryInterface, Sequelize) {
  const [columns] = await queryInterface.sequelize.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'empleados'`
  );
  const existing = new Set(columns.map(row => row.COLUMN_NAME));

  if (!existing.has('id_persona')) {
    const [countRows] = await queryInterface.sequelize.query('SELECT COUNT(*) AS total FROM empleados');
    const total = Number(countRows[0]?.total || 0);
    if (total > 0) {
      throw new Error('No se puede agregar id_persona automáticamente porque empleados ya contiene registros. Asigná primero una persona a cada empleado.');
    }

    await queryInterface.addColumn('empleados', 'id_persona', {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
    });
  }

  const [constraints] = await queryInterface.sequelize.query(
    `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'empleados'
       AND COLUMN_NAME = 'id_persona' AND REFERENCED_TABLE_NAME = 'personas'`
  );

  if (!constraints.length) {
    await queryInterface.addConstraint('empleados', {
      fields: ['id_persona'],
      type: 'foreign key',
      name: 'fk_empleados_personas',
      references: { table: 'personas', field: 'id_persona' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  }
}

export async function down(queryInterface) {
  const [constraints] = await queryInterface.sequelize.query(
    `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'empleados'
       AND COLUMN_NAME = 'id_persona' AND REFERENCED_TABLE_NAME = 'personas'`
  );
  if (constraints.length) {
    await queryInterface.removeConstraint('empleados', constraints[0].CONSTRAINT_NAME);
  }
  await queryInterface.removeColumn('empleados', 'id_persona');
}
