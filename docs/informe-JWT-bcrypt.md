# Informe técnico — autenticación con JWT y bcrypt en Dalssi Hotel

## 1. Objetivo

La segunda etapa incorpora autenticación de usuarios al backend existente de Dalssi Hotel. La solución usa cuentas vinculadas a `personas`, contraseñas protegidas con bcrypt y tokens JWT con expiración.

## 2. Modelo de usuario

`usuarios` no duplica nombre ni correo porque esos datos ya pertenecen a `personas`.

```text
personas
- id_persona PK
- identificacion
- nombre
- apellidos
- telefono
- correo
- estado
        1
        |
        | 0..1
        v
usuarios
- id_usuario PK
- id_persona FK UNIQUE
- contraseña
- fecha_creacion
```

Esto permite que una persona existente cree una cuenta sin duplicar sus datos.

## 3. Registro

El endpoint `POST /api/auth/register` recibe nombre, apellidos, correo y contraseña. Primero busca una persona por correo. Si ya existe, utiliza su `id_persona`; si no existe, crea la persona. Después verifica que esa persona no tenga ya un usuario y almacena la contraseña mediante bcrypt.

La contraseña nunca se guarda en texto plano. OWASP recomienda utilizar algoritmos de hashing adaptativos como bcrypt cuando corresponde, y señala que las contraseñas no deben almacenarse en texto plano. urlOWASP Password Storage Cheat Sheethttps://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

## 4. Bcrypt

Bcrypt es un algoritmo de hashing diseñado para hacer costoso el proceso de prueba de contraseñas. En esta implementación se utiliza un factor de trabajo de 10 mediante `bcryptjs`.

El sistema solamente almacena el resultado del hash en `usuarios.contraseña`. Durante el login se usa comparación de hash, nunca se intenta recuperar la contraseña original.

## 5. JWT

JWT permite transportar claims firmados entre el frontend y el backend. El estándar RFC 7519 define JWT como un formato compacto para representar claims y establece el claim `exp` como tiempo de expiración del token. urlRFC 7519 — JSON Web Tokenhttps://www.rfc-editor.org/rfc/rfc7519.html

Dalssi utiliza un JWT firmado con HS256 y un secreto definido mediante `JWT_SECRET` en el archivo `.env`. La duración por defecto es de `2h` y puede cambiarse mediante `JWT_EXPIRES_IN`.

El token contiene únicamente información necesaria para identificar la sesión:

```json
{
  "id_usuario": 1,
  "id_persona": 1,
  "correo": "persona@ejemplo.com",
  "puesto": "Recepción"
}
```

No se incluye la contraseña ni información sensible innecesaria. OWASP advierte que un JWT firmado no es cifrado: su payload puede ser leído, por lo que no deben incluirse secretos dentro de sus claims. urlOWASP JSON Web Token Cheat Sheethttps://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html

## 6. Middleware de autenticación

El middleware `authenticate` busca el encabezado:

```text
Authorization: Bearer <token>
```

Si no existe, responde `401`. Si existe pero es inválido o expiró, también responde `401`. Cuando es válido, sus claims quedan disponibles en `req.user` y la solicitud continúa.

Las rutas públicas son:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` requiere token

El resto de las rutas de la API requiere autenticación.

## 7. Frontend

El JWT se almacena en una cookie `HttpOnly` llamada `dalssi_token`. React no puede leer el token directamente. Las solicitudes del frontend usan `credentials: include` para que el navegador envíe automáticamente la cookie. Si una solicitud devuelve `401`, se limpia la sesión local y el usuario es enviado a `/login`.

Se incorporaron:

- `/login`
- `/register`
- protección de las rutas administrativas y separación de las interfaces de cliente y empleado
- persistencia de sesión
- cierre de sesión
- consulta de sesión mediante `/api/auth/me`

## 8. Validaciones

Backend:

- correo obligatorio y con formato válido
- contraseña obligatoria
- contraseña mínima de 8 caracteres
- persona existente o creación de una nueva persona
- una sola cuenta por persona
- persona inactiva no puede iniciar sesión
- credenciales inválidas devuelven `401`
- recursos inexistentes devuelven `404`
- conflictos de unicidad devuelven `409`

Frontend:

- campos obligatorios
- tipo email
- mínimo de 8 caracteres
- confirmación de contraseña
- mensajes de error provenientes de la API

## 9. Conclusión

La solución separa correctamente identidad personal y credenciales: `personas` mantiene la información personal y `usuarios` mantiene únicamente la información necesaria para autenticación. JWT protege el acceso a la API y bcrypt evita almacenar contraseñas en texto plano.
