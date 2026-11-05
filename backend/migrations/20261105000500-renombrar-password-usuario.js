export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable('usuarios');
  if (table.password && !table['contraseña']) {
    await queryInterface.renameColumn('usuarios', 'password', 'contraseña');
  }
}

export async function down(queryInterface) {
  const table = await queryInterface.describeTable('usuarios');
  if (table['contraseña'] && !table.password) {
    await queryInterface.renameColumn('usuarios', 'contraseña', 'password');
  }
}
