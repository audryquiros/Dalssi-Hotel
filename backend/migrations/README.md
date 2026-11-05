# Migraciones de Dalssi

Las migraciones se ejecutan con Sequelize CLI.

```bash
npm run db:migrate
npm run db:migrate:status
```

La migración `20261104000100-baseline-dalssi.js` verifica el esquema existente y no elimina tablas ni datos.

La migración `20261104000200-empleados-persona.js` ajusta `empleados` para utilizar `id_persona` como llave foránea hacia `personas`, manteniendo `id_empleado` como llave primaria.

No usar `sequelize.sync({ alter: true })` para modificar el esquema aprobado.

## Puesto de empleados

La migración `20261104000300-empleados-puesto.js` crea el catálogo `puesto` y reemplaza el texto `empleados.puesto` por `empleados.id_puesto` como llave foránea. Los puestos existentes se migran automáticamente antes de eliminar la columna de texto.
