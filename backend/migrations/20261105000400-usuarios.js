export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('usuarios', {
    id_usuario: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_persona: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'personas', key: 'id_persona' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    fecha_creacion: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('usuarios');
}
