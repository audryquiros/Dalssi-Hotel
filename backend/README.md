# Backend Dalssi Hotel

Node.js + Express + Sequelize + MySQL, organizado con MVC.

## Instalación
1. Copiar `.env.example` a `.env` y configurar credenciales MySQL.
2. `npm install`
3. `npm run db:create` (si la base aún no existe).
4. Aplicar `database/schema.sql` para crear las 16 tablas según el DER.
5. `npm run db:migrate` para registrar la línea base de migraciones.
6. `npm run dev`

## Migraciones
Las migraciones están en `migrations/`. La primera es una línea base no destructiva que verifica las 16 tablas ya creadas. Las futuras modificaciones del esquema deben agregarse como nuevas migraciones. No usar `sync({ alter: true })`.

## API
`GET /api/health` y CRUD genérico `GET/POST/PUT/DELETE /api/:tabla`. Tablas admitidas: personas, clientes, paises, huespedes, empleados, tipos_habitacion, habitaciones, reservaciones, detalle_reservacion, detalle_huespedes, categorias_servicios, servicios, reservacion_servicios, pagos, facturas y detalle_factura.
