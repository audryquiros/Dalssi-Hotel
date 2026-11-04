# Migraciones Sequelize

Las migraciones versionan cambios del esquema. La migración inicial incluida registra la estructura existente de Dalssi como línea base y valida que las 16 tablas del DER ya existan.

Para bases nuevas, ejecutar primero `npm run db:create` y después `npm run db:migrate`. No usar `sequelize.sync({ alter: true })`: el esquema oficial está en `database/schema.sql`.
