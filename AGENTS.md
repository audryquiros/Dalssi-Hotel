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
- El estilo compartido de las páginas CRUD (`CrudPage.css`) debe cargarse globalmente porque las páginas CRUD reutilizan sus clases aunque no rendericen el componente `CrudPage`. No eliminar esta carga al modificar una página.
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
- Todas las páginas principales usan el mismo patrón visual de Dalssi.
- El header de página muestra, en este orden: `DALSSI HOTEL`, título de la página y subtítulo/descripcion inmediatamente debajo del título.
- El sidebar es fijo, ocupa la altura completa de la ventana y no debe desplazarse con el contenido principal.
- El botón de creación (`Nuevo ...`) permanece dentro del área de contenido, arriba de la toolbar y alineado a la derecha.
- La toolbar mantiene la misma estructura: búsqueda, actualizar y contador; Reservaciones puede añadir el acceso a Calendario sin romper la estructura.
- Tablas, modales, dropdowns y calendarios deben conservar la estética Dalssi: azul profundo, lavanda, fondos claros, bordes suaves y sombras discretas.
- Los dropdowns personalizados y calendarios deben renderizar sus menús mediante portal para no quedar recortados por modales o contenedores con overflow.
- Todo campo basado en ENUM debe usar un dropdown con las opciones definidas por el modelo/base de datos; no usar inputs de texto para ENUM.
- Las opciones ENUM visibles en tablas y detalles deben usar badges con colores semánticos consistentes.
- Las relaciones FK que el usuario selecciona deben mostrarse como dropdowns y, en detalles/listados cuando sea útil, usar nombres legibles en lugar de IDs.
- Los modales de detalle deben priorizar información humana y contextual; los IDs solo se muestran cuando aportan valor de referencia.
- Validar formularios, confirmar eliminaciones y mostrar mensajes claros de éxito o error.
- El CRUD debe probarse desde el frontend conectado al backend y MySQL; no depender de Postman para la validación funcional principal.


## 9. Reglas funcionales de facturación
- La factura se relaciona con una reservación; el cliente se obtiene automáticamente desde esa reservación.
- En la creación de una factura, el usuario solo selecciona una reservación disponible. No debe introducir manualmente el número de factura, subtotal, impuesto ni total.
- Una reservación puede tener como máximo una factura. Las reservaciones que ya tienen factura no aparecen en el dropdown de nueva factura.
- El número de factura lo genera automáticamente el backend con el formato `DAL-AAAA-NNNN`.
- El impuesto se calcula en el backend. La tasa vigente por defecto es 13% y se conserva el valor monetario calculado en `impuestos`; no se requiere cambiar el esquema de la BD para manejar el porcentaje.
- El subtotal de una nueva factura se obtiene de los cargos de la reservación: noches de habitación y servicios asociados.
- Las facturas emitidas no se eliminan físicamente. Se pueden consultar e imprimir y únicamente se permite editar la reservación asociada, siempre que la nueva reservación tenga un pago confirmado; al cambiarla se recalcula el desglose y los totales en backend.
- En el detalle de una factura se muestra la reservación y el cliente responsable de la reservación. No es necesario mostrar al huésped como titular de la factura.


## 10. Reglas funcionales de pagos
- Una reservación solo puede tener un pago; la BD debe mantener una restricción única sobre `id_reservacion`.
- Las reservaciones que ya tienen pago no aparecen al crear un nuevo pago.
- Al seleccionar una reservación, el monto se calcula automáticamente desde noches de habitación y servicios asociados. El frontend muestra el desglose y el total; el backend valida el monto.
- Los métodos y estados de pago se seleccionan mediante dropdown y se muestran con badges.
- Un pago confirmado habilita la emisión de la factura correspondiente, siempre que todavía no exista una factura para esa reservación.
- No se debe emitir una factura para una reservación sin pago confirmado.

## 11. Reglas de historial y estados
- `personas`, `clientes` y `huespedes` manejan `estado` con `activo` e `inactivo`.
- Eliminar un cliente o huésped significa inactivarlo, conservando sus registros e historial. La persona asociada también se inactiva.
- Los registros inactivos no deben aparecer como opciones para nuevas reservaciones.
