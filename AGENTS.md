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
