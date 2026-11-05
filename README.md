# Dalssi Hotel — Segunda parte

Aplicación web de gestión hotelera con React + Vite en frontend y Node.js + Express + Sequelize + MySQL en backend.

## Tecnologías

- React + Vite
- React Router
- Tailwind CSS 4 + CSS por componente
- Lucide React
- Node.js + Express
- Sequelize
- MySQL
- JWT
- bcryptjs

## Estructura

```text
frontend/
  src/
    components/
    context/
    layouts/
    pages/
    routes/
    services/

backend/
  src/
    controllers/
    middleware/
    models/
    routes/
    utils/
  migrations/
  database/

docs/
  DER-actualizado.md
  informe-JWT-bcrypt.md
  postman-collection.json
```

## Configuración backend

1. Entrar a `backend`.
2. Copiar `.env.example` como `.env`.
3. Configurar las credenciales de MySQL.
4. Generar un secreto largo y aleatorio para `JWT_SECRET`.
5. Ejecutar:

```bash
npm install
npm run db:migrate
npm run dev
```

Si ya ejecutaste la migración anterior de `usuarios`, la nueva migración renombra `password` a `contraseña` sin eliminar los registros existentes.

## Configuración frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend utiliza `VITE_API_URL` del `.env`.

## Autenticación

Rutas públicas:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/health`

Ruta de sesión:

- `GET /api/auth/me` autenticado mediante cookie HttpOnly `dalssi_token`.

Todas las demás rutas requieren autenticación.

## Registro con personas existentes

El registro busca primero una persona por correo. Si existe, crea el usuario asociado a su `id_persona` y no duplica sus datos. Si no existe, crea una nueva persona y después el usuario.

Una persona solo puede tener una cuenta porque `usuarios.id_persona` es `UNIQUE`.

## Pruebas

La colección de Postman/Thunder Client está en:

```text
docs/postman-collection.json
```

Incluye autenticación, CRUD de usuarios y ejemplos de 401 y 404.

## Documentación

- `docs/informe-JWT-bcrypt.md`: investigación y explicación técnica.
- `docs/DER-actualizado.md`: actualización del modelo con `usuarios`.
- `AGENTS.md`: reglas del proyecto y arquitectura acordada.


## Interfaces

- `/` — landing pública del hotel.
- `/login` y `/register` — acceso y creación de cuenta.
- `/cliente` — portal del cliente, con el mismo lenguaje visual del landing.
- `/cliente/reservaciones` — consulta de las reservaciones propias.
- `/admin` — panel administrativo protegido para empleados.

La autenticación utiliza JWT en una cookie HttpOnly. El frontend envía la cookie mediante `credentials: 'include'`; no se almacena el JWT en `localStorage`. El backend distingue `cliente` y `empleado` y aplica autorización tanto en las rutas de React como en las rutas de la API.
