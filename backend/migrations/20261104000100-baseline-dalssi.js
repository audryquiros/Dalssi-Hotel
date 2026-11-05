const TABLES = [
  'personas','clientes','paises','huespedes','empleados','tipos_habitacion','habitaciones',
  'reservaciones','detalle_reservacion','detalle_huespedes','categorias_servicios','servicios',
  'reservacion_servicios','pagos','facturas','detalle_factura'
];

export async function up(queryInterface) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()`
  );
  const existing = new Set(rows.map(row => row.TABLE_NAME));
  const missing = TABLES.filter(table => !existing.has(table));
  if (missing.length) {
    throw new Error(`Faltan tablas del esquema Dalssi: ${missing.join(', ')}. Ejecutá npm run db:create y aplicá database/schema.sql antes de migrar.`);
  }
}

export async function down() {
  // La migración es una línea base: no elimina tablas ni datos existentes.
}
