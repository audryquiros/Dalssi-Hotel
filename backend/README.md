# Backend — Dalssi Hotel

API REST con Node.js, Express y MySQL. La estructura de tablas corresponde al DER aprobado (`mini proyecto (2).json`).

## Requisitos
- Node.js 20 o superior
- MySQL 8 o compatible

## Configuración
1. Copiar `.env.example` a `.env`.
2. Completar `DB_HOST`, `DB_PORT`, `DB_USER` y `DB_PASSWORD`.
3. Instalar dependencias: `npm install`.
4. Crear la base de datos y sus tablas: `npm run db:create`.
5. Iniciar API: `npm run dev`.

El script SQL crea/verifica la base `dalssi_hotel` y las 16 tablas del DER. No inserta datos de prueba automáticamente.

## Endpoints
- `GET /api/health`
- `GET /api/:tabla`
- `GET /api/:tabla/:id`
- `POST /api/:tabla`
- `PUT /api/:tabla/:id`
- `DELETE /api/:tabla/:id`

Tablas permitidas: `personas`, `clientes`, `huespedes`, `empleados`, `paises`, `tipos_habitacion`, `habitaciones`, `reservaciones`, `detalle_reservacion`, `detalle_huespedes`, `categorias_servicios`, `servicios`, `reservacion_servicios`, `pagos`, `facturas`, `detalle_factura`.

Los cuerpos POST/PUT usan nombres de columnas del DER. Las claves foráneas y restricciones de MySQL validan las relaciones. Esta primera versión ofrece CRUD base; reglas de negocio específicas (disponibilidad, cálculos de factura, transiciones de reservación) se implementarán cuando se definan.


## Arquitectura MVC

El backend está organizado siguiendo Modelo–Vista–Controlador (MVC):

- `src/models/`: modelos de las 16 entidades; cada uno encapsula el acceso a su tabla mediante `BaseModel`.
- `src/controllers/`: recibe las solicitudes, utiliza el modelo correspondiente y construye las respuestas HTTP.
- `src/routes/`: declara los endpoints y los vincula con los controladores.
- `src/config/`: configuración y conexión a MySQL.
- `src/middleware/`: manejo centralizado de errores.

La vista corresponde al frontend React, que consume la API del backend.
