export async function up(queryInterface) {
  // facturas.id_reservacion NO debe ser UNIQUE:
  // una reservación puede tener varias facturas a lo largo del tiempo,
  // siempre que solo una permanezca emitida.
  const [indexes] = await queryInterface.sequelize.query(
    `SHOW INDEX FROM facturas WHERE Column_name = 'id_reservacion' AND Non_unique = 0`
  );

  for (const index of indexes) {
    if (index.Key_name !== 'PRIMARY') {
      try {
        await queryInterface.removeIndex('facturas', index.Key_name);
      } catch (_) {
        // Si el índice ya no existe, no hay nada que hacer.
      }
    }
  }
}

export async function down(queryInterface) {
  const [indexes] = await queryInterface.sequelize.query(
    `SHOW INDEX FROM facturas WHERE Column_name = 'id_reservacion' AND Non_unique = 0`
  );

  if (!indexes.length) {
    await queryInterface.addIndex('facturas', ['id_reservacion'], {
      unique: true,
      name: 'uq_facturas_reservacion',
    });
  }
}
