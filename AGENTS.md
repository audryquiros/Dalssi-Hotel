# AGENTS.md — Dalssi Hotel

## 1. Objetivo
Desarrollar una aplicación web de gestión hotelera para Dalssi, un hotel ficticio cuya identidad transmite hospitalidad cálida, comodidad, modernidad y elegancia accesible.

## 2. Tecnologías acordadas
- Frontend: React + Vite.
- Estilos: Tailwind CSS 4 y CSS por componente cuando corresponda.
- Navegación: React Router.
- Iconografía: Lucide React.
- Backend: Node.js + Express.
- ORM: Sequelize.
- Base de datos: MySQL, conectada y gestionada desde el backend.
- Migraciones: Sequelize CLI.
- Arquitectura backend: Modelo-Vista-Controlador (Models, Controllers, Routes).

## 3. Orden de desarrollo
1. Construir y validar el frontend.
2. Desarrollar el backend con arquitectura MVC y Sequelize.
3. Desde el backend, configurar la conexión, migraciones y scripts de MySQL conforme al DER aprobado.
4. Integrar frontend y backend y validar los CRUD desde la interfaz.

No modificar el DER ni agregar entidades o relaciones sin indicación del usuario.

## 4. Identidad de marca
- Nombre: Dalssi Hotel.
- Personalidad: cálida, acogedora, moderna, cercana y sofisticada.
- Posicionamiento: experiencia cómoda y de calidad, accesible y elegante.
- Concepto visual: tranquilidad, descanso y bienestar.
- Símbolo: monograma D integrado con una luna creciente y una estrella.
- Paleta propuesta:
  - Azul profundo: `#1E2A5A` (principal).
  - Azul elegante: `#3E5BA6` (secundario).
  - Lavanda: `#8C7BC4` (acento).
  - Azul suave: `#B3C7E6` (apoyo).
  - Lavanda clara: `#EDE9F8` (fondos suaves).
- Tipografías: Playfair Display para títulos y Nunito Sans para textos e interfaz.
- Mantener suficiente contraste y una interfaz clara, accesible y responsive.
- Los archivos de marca se guardan en `frontend/public/logo/`.

## 5. Convenciones del frontend
- Cada componente reutilizable debe vivir en su propia carpeta.
- Cada componente debe tener su archivo `.jsx` y su archivo `.css` correspondiente.
- Las páginas también se organizan en carpetas independientes.
- Mantener separados componentes, páginas, layouts, rutas, assets y estilos globales.
- Evitar componentes monolíticos y código duplicado.
- Usar nombres descriptivos y consistentes.

## 6. Base de datos y reglas funcionales
- El DER aprobado es la fuente de verdad para entidades, atributos y relaciones.
- No agregar, eliminar ni modificar entidades, atributos o relaciones sin autorización.
- No inventar reglas de negocio cuando no estén definidas; consultar al usuario.
- Los scripts SQL y la conexión MySQL se implementarán en el backend, no en el navegador.

## 7. Calidad y metodología
- Avanzar de forma incremental y validar cada etapa.
- No introducir dependencias innecesarias.
- Documentar decisiones y lógica no obvia.
- Manejar errores y validar datos en sus respectivas capas.
- Consultar antes de tomar decisiones que afecten arquitectura, DER o alcance.
- Mantener el diseño visual coherente con el branding de Dalssi.


## 8. Estructura visual estándar definitiva
Todas las páginas principales de Dalssi deben seguir esta jerarquía visual:

### Header
- Mostrar `DALSSI HOTEL`.
- Debajo mostrar el nombre de la sección en `Playfair Display`.
- Debajo del nombre mostrar un subtítulo/descripcion breve en `Nunito Sans`.
- El nombre y subtítulo son responsabilidad del Header/Layout, no del contenido de la página.
- No repetir el título ni la descripción dentro de la página.

### Contenido
Después del Header, el contenido de la página debe comenzar directamente con una barra de herramientas funcional:
- buscador;
- botón de acción principal de la sección, colocado en la misma barra y junto al buscador;
- botones secundarios como Calendario cuando corresponda;
- botón de actualizar;
- cantidad de registros;
- tabla, tarjetas o contenido específico de la sección.

Las páginas CRUD deben mantener la misma jerarquía, espaciado, bordes, radios, tablas y acciones visuales que el estándar establecido en Facturas.

### Descripciones oficiales
- Dashboard: `Resumen general de la operación del hotel.`
- Clientes: `Clientes registrados y sus datos personales.`
- Huéspedes: `Huéspedes registrados y sus datos personales.`
- Empleados: `Personal del hotel y sus datos personales.`
- Habitaciones: `Habitaciones, tipos, ubicación y disponibilidad del hotel.`
- Reservaciones: `Administración de reservaciones.`
- Servicios: `Servicios disponibles para las reservaciones del hotel.`
- Pagos: `Administración y seguimiento de pagos.`
- Facturas: `Emisión, impuestos y control de facturación del hotel.`

Esta estructura es el estándar visual definitivo y no debe duplicarse o modificarse página por página sin una razón de diseño clara.


## 9. Estructura de navegación y comportamiento del layout
- El Sidebar es fijo (`position: fixed`) y ocupa toda la altura visible (`100vh`); no debe desplazarse con el contenido.
- El contenido principal debe reservar el ancho del Sidebar mediante `margin-left`.
- El Header permanece dentro del área principal y sigue la estructura visual definitiva definida arriba.
- Los botones de acción como `Nuevo cliente`, `Nueva reservación`, `Nueva factura`, etc. pertenecen al contenido de cada página, no al Header, y deben ubicarse en la barra de herramientas junto al buscador.
- El estándar de Facturas es la referencia visual para tablas CRUD: buscador, actualización, contador, tabla, badges y acciones.
- Las Reservaciones mantienen la vista de tabla como vista principal y cuentan con un botón secundario `Calendario` que abre un modal interactivo. El calendario no reemplaza la tabla ni ocupa permanentemente espacio adicional.
- El calendario de Reservaciones debe permitir navegar entre meses, volver a Hoy, visualizar las reservaciones por rango de fechas y seleccionar una reservación para consultar su detalle.
- Los estados ENUM deben conservar opciones predeterminadas y presentarse con colores semánticos consistentes con Dalssi.
