import sequelize from '../src/config/database.js';
import { models } from '../src/models/index.js';

const {
  personas: Persona,
  clientes: Cliente,
  paises: Pais,
  huespedes: Huesped,
  empleados: Empleado,
  puesto: Puesto,
  tipos_habitacion: TipoHabitacion,
  habitaciones: Habitacion,
  reservaciones: Reservacion,
  detalle_reservacion: DetalleReservacion,
  detalle_huespedes: DetalleHuesped,
  categorias_servicios: CategoriaServicio,
  servicios: Servicio,
  reservacion_servicios: ReservacionServicio,
  pagos: Pago,
  facturas: Factura,
  detalle_factura: DetalleFactura,
} = models;

const personas = [
  { identificacion: '1-1111-1111', nombre: 'Ana', apellidos: 'Rodríguez Vargas', telefono: '8888-1111', correo: 'ana.rodriguez@dalssi.test' },
  { identificacion: '1-2222-2222', nombre: 'Carlos', apellidos: 'Méndez Solís', telefono: '8888-2222', correo: 'carlos.mendez@dalssi.test' },
  { identificacion: '1-3333-3333', nombre: 'María', apellidos: 'López Jiménez', telefono: '8888-3333', correo: 'maria.lopez@dalssi.test' },
  { identificacion: '1-4444-4444', nombre: 'Diego', apellidos: 'Castro Rojas', telefono: '8888-4444', correo: 'diego.castro@dalssi.test' },
  { identificacion: '1-5555-5555', nombre: 'Sofía', apellidos: 'Ramírez Mora', telefono: '8888-5555', correo: 'sofia.ramirez@dalssi.test' },
  { identificacion: '1-6666-6666', nombre: 'Laura', apellidos: 'Gómez Pérez', telefono: '8888-6666', correo: 'laura.gomez@dalssi.test' },
  { identificacion: '1-7777-7777', nombre: 'Andrés', apellidos: 'Vargas León', telefono: '8888-7777', correo: 'andres.vargas@dalssi.test' },
  { identificacion: '1-8888-8888', nombre: 'Valentina', apellidos: 'Herrera Ruiz', telefono: '8888-8888', correo: 'valentina.herrera@dalssi.test' },
  { identificacion: '1-9999-9999', nombre: 'José', apellidos: 'Sánchez Mora', telefono: '8888-9999', correo: 'jose.sanchez@dalssi.test' },
  { identificacion: '2-1111-1111', nombre: 'Camila', apellidos: 'Navarro Díaz', telefono: '8777-1111', correo: 'camila.navarro@dalssi.test' },
  { identificacion: '2-2222-2222', nombre: 'Luis', apellidos: 'Fernández Solano', telefono: '8777-2222', correo: 'luis.fernandez@dalssi.test' },
  { identificacion: '2-3333-3333', nombre: 'Elena', apellidos: 'Mora Quesada', telefono: '8777-3333', correo: 'elena.mora@dalssi.test' },
  { identificacion: '2-4444-4444', nombre: 'Mateo', apellidos: 'Alvarado Vega', telefono: '8777-4444', correo: 'mateo.alvarado@dalssi.test' },
  { identificacion: '2-5555-5555', nombre: 'Natalia', apellidos: 'Rojas Chaves', telefono: '8777-5555', correo: 'natalia.rojas@dalssi.test' },
  { identificacion: '2-6666-6666', nombre: 'Pablo', apellidos: 'Jiménez Arias', telefono: '8777-6666', correo: 'pablo.jimenez@dalssi.test' },
  { identificacion: '2-7777-7777', nombre: 'Isabella', apellidos: 'Cordero Méndez', telefono: '8777-7777', correo: 'isabella.cordero@dalssi.test' },
];

const paises = [
  { nombre: 'Costa Rica', nacionalidad: 'Costarricense' },
  { nombre: 'Estados Unidos', nacionalidad: 'Estadounidense' },
  { nombre: 'México', nacionalidad: 'Mexicana' },
  { nombre: 'España', nacionalidad: 'Española' },
  { nombre: 'Colombia', nacionalidad: 'Colombiana' },
];

const puestos = ['Recepcionista', 'Gerente', 'Limpieza', 'Administrador'];

const tipos = [
  { nombre: 'Individual', descripcion: 'Habitación para una persona.', capacidad: 1, precio_base: 28000 },
  { nombre: 'Doble', descripcion: 'Habitación para dos personas.', capacidad: 2, precio_base: 38000 },
  { nombre: 'Familiar', descripcion: 'Habitación amplia para familias.', capacidad: 4, precio_base: 52000 },
  { nombre: 'Suite', descripcion: 'Habitación premium con mayor espacio y comodidades.', capacidad: 2, precio_base: 75000 },
];

const categorias = [
  { nombre: 'Alimentación', descripcion: 'Alimentos y bebidas.', estado: 'activo' },
  { nombre: 'Bienestar', descripcion: 'Servicios de relajación y bienestar.', estado: 'activo' },
  { nombre: 'Transporte', descripcion: 'Servicios de traslado.', estado: 'activo' },
  { nombre: 'Experiencias', descripcion: 'Actividades y experiencias para huéspedes.', estado: 'activo' },
];

const servicios = [
  { categoria: 'Alimentación', nombre: 'Desayuno continental', descripcion: 'Desayuno servido en el hotel.', precio: 6500, estado: 'activo' },
  { categoria: 'Alimentación', nombre: 'Cena para dos', descripcion: 'Cena especial para dos personas.', precio: 18000, estado: 'activo' },
  { categoria: 'Bienestar', nombre: 'Masaje relajante', descripcion: 'Sesión de masaje de 60 minutos.', precio: 25000, estado: 'activo' },
  { categoria: 'Bienestar', nombre: 'Acceso a zona de bienestar', descripcion: 'Acceso por persona.', precio: 12000, estado: 'activo' },
  { categoria: 'Transporte', nombre: 'Traslado aeropuerto', descripcion: 'Traslado privado desde o hacia el aeropuerto.', precio: 22000, estado: 'activo' },
  { categoria: 'Transporte', nombre: 'Traslado al centro', descripcion: 'Traslado privado al centro de la ciudad.', precio: 12000, estado: 'activo' },
  { categoria: 'Experiencias', nombre: 'Tour local', descripcion: 'Recorrido guiado por atractivos cercanos.', precio: 30000, estado: 'activo' },
  { categoria: 'Experiencias', nombre: 'Experiencia gastronómica', descripcion: 'Actividad gastronómica guiada.', precio: 28000, estado: 'activo' },
];

async function findOrCreatePersona(data) {
  const [record] = await Persona.findOrCreate({ where: { identificacion: data.identificacion }, defaults: data });
  return record;
}

async function run() {
  await sequelize.authenticate();
  console.log('Conexión con MySQL establecida.');

  const personaCount = await Persona.count();
  if (personaCount > 0) {
    console.log('La tabla personas ya contiene datos. No se cargaron seeders para evitar duplicados.');
    console.log('Si querés reconstruir los datos de prueba, primero vaciamos las tablas en un proceso separado.');
    return;
  }

  const createdPersons = [];
  for (const data of personas) createdPersons.push(await findOrCreatePersona(data));

  const paisMap = {};
  for (const data of paises) {
    const [pais] = await Pais.findOrCreate({ where: { nombre: data.nombre }, defaults: data });
    paisMap[data.nombre] = pais;
  }

  const puestoMap = {};
  for (const nombre of puestos) {
    const [puesto] = await Puesto.findOrCreate({ where: { nombre }, defaults: { nombre } });
    puestoMap[nombre] = puesto;
  }

  // 5 clientes: personas 1-5
  for (let i = 0; i < 5; i++) {
    await Cliente.create({ id_persona: createdPersons[i].id_persona, direccion: ['San José, Costa Rica', 'Escazú, San José', 'Heredia, Costa Rica', 'Cartago, Costa Rica', 'Alajuela, Costa Rica'][i], fecha_registro: new Date('2026-10-01T09:00:00') });
  }

  // 6 huéspedes: personas 6-11
  const guestCountries = ['Costa Rica', 'Estados Unidos', 'México', 'España', 'Colombia', 'Costa Rica'];
  for (let i = 5; i < 11; i++) {
    await Huesped.create({ id_persona: createdPersons[i].id_persona, id_pais: paisMap[guestCountries[i - 5]].id_pais });
  }

  // 5 empleados: personas 12-16
  const employeeRoles = ['Gerente', 'Recepcionista', 'Recepcionista', 'Limpieza', 'Administrador'];
  for (let i = 11; i < 16; i++) {
    await Empleado.create({ id_persona: createdPersons[i].id_persona, id_puesto: puestoMap[employeeRoles[i - 11]].id_puesto, fecha_contratacion: new Date(`2025-0${i - 10}-15T08:00:00`), estado: 'activo' });
  }

  const tipoMap = {};
  for (const data of tipos) {
    const [tipo] = await TipoHabitacion.findOrCreate({ where: { nombre: data.nombre }, defaults: data });
    tipoMap[data.nombre] = tipo;
  }

  const habitaciones = [
    { tipo: 'Individual', numero: '101', piso: 1, ubicacion: 'Ala norte', descripcion: 'Habitación individual con vista al jardín.', estado: 'disponible' },
    { tipo: 'Individual', numero: '102', piso: 1, ubicacion: 'Ala norte', descripcion: 'Habitación individual cerca de recepción.', estado: 'limpieza' },
    { tipo: 'Doble', numero: '201', piso: 2, ubicacion: 'Ala este', descripcion: 'Habitación doble con balcón.', estado: 'disponible' },
    { tipo: 'Doble', numero: '202', piso: 2, ubicacion: 'Ala este', descripcion: 'Habitación doble con vista al jardín.', estado: 'ocupada' },
    { tipo: 'Doble', numero: '203', piso: 2, ubicacion: 'Ala oeste', descripcion: 'Habitación doble tranquila.', estado: 'mantenimiento' },
    { tipo: 'Familiar', numero: '301', piso: 3, ubicacion: 'Ala oeste', descripcion: 'Habitación familiar amplia.', estado: 'disponible' },
    { tipo: 'Familiar', numero: '302', piso: 3, ubicacion: 'Ala oeste', descripcion: 'Habitación familiar con dos camas.', estado: 'disponible' },
    { tipo: 'Suite', numero: '401', piso: 4, ubicacion: 'Ala premium', descripcion: 'Suite con sala y balcón.', estado: 'ocupada' },
    { tipo: 'Suite', numero: '402', piso: 4, ubicacion: 'Ala premium', descripcion: 'Suite premium con vista panorámica.', estado: 'disponible' },
    { tipo: 'Doble', numero: '204', piso: 2, ubicacion: 'Ala este', descripcion: 'Habitación doble.', estado: 'disponible' },
];

const roomMap = {};
for (const data of habitaciones) {
  const [room] = await Habitacion.findOrCreate({ where: { numero: data.numero }, defaults: { ...data, id_tipo_habitacion: tipoMap[data.tipo].id_tipo_habitacion } });
  roomMap[data.numero] = room;
}

const categoryMap = {};
for (const data of categorias) {
  const [category] = await CategoriaServicio.findOrCreate({ where: { nombre: data.nombre }, defaults: data });
  categoryMap[data.nombre] = category;
}

const serviceMap = {};
for (const data of servicios) {
  const [service] = await Servicio.findOrCreate({ where: { nombre: data.nombre }, defaults: { ...data, id_categoria_servicio: categoryMap[data.categoria].id_categoria_servicio } });
  serviceMap[data.nombre] = service;
}

const clientes = await Cliente.findAll({ order: [['id_cliente', 'ASC']] });
const empleados = await Empleado.findAll({ order: [['id_empleado', 'ASC']] });
const huespedes = await Huesped.findAll({ order: [['id_huesped', 'ASC']] });

const reservationData = [
  { cliente: 0, empleado: 1, entrada: '2026-11-01', salida: '2026-11-04', estado: 'finalizada', obs: 'Estadía completada.' },
  { cliente: 1, empleado: 2, entrada: '2026-11-04', salida: '2026-11-07', estado: 'en_curso', obs: 'Huésped solicita desayuno diario.' },
  { cliente: 2, empleado: 0, entrada: '2026-11-10', salida: '2026-11-13', estado: 'confirmada', obs: 'Llegada prevista en la tarde.' },
  { cliente: 3, empleado: 1, entrada: '2026-11-12', salida: '2026-11-15', estado: 'confirmada', obs: 'Solicita habitación tranquila.' },
  { cliente: 4, empleado: 2, entrada: '2026-11-15', salida: '2026-11-18', estado: 'pendiente', obs: 'Pendiente de confirmación.' },
  { cliente: 0, empleado: 3, entrada: '2026-11-20', salida: '2026-11-22', estado: 'cancelada', obs: 'Cancelación solicitada por el cliente.' },
];

const reservations = [];
for (let i = 0; i < reservationData.length; i++) {
  const data = reservationData[i];
  const [reservation] = await Reservacion.findOrCreate({
    where: { id_cliente: clientes[data.cliente].id_cliente, fecha_entrada: data.entrada, fecha_salida: data.salida },
    defaults: {
      id_cliente: clientes[data.cliente].id_cliente,
      id_empleado: empleados[data.empleado].id_empleado,
      fecha_reservacion: new Date(`2026-10-${String(20 + i).padStart(2, '0')}T10:00:00`),
      fecha_entrada: data.entrada,
      fecha_salida: data.salida,
      estado: data.estado,
      observaciones: data.obs,
    },
  });
  reservations.push(reservation);
}

const detailRooms = [
  ['101', 0], ['202', 1], ['401', 2], ['301', 3], ['302', 4], ['204', 5],
];
const detailGuests = [0, 1, 2, 3, 4, 5];

const detailMap = {};
for (let i = 0; i < reservations.length; i++) {
  const room = roomMap[detailRooms[i][0]];
  const tipo = await TipoHabitacion.findByPk(room.id_tipo_habitacion);
  const [detail] = await DetalleReservacion.findOrCreate({
    where: { id_reservacion: reservations[i].id_reservacion, id_habitacion: room.id_habitacion },
    defaults: { id_reservacion: reservations[i].id_reservacion, id_habitacion: room.id_habitacion, precio_noche: tipo.precio_base },
  });
  detailMap[i] = detail;

  await DetalleHuesped.findOrCreate({
    where: { id_detalle_reservacion: detail.id_detalle_reservacion, id_huesped: huespedes[detailGuests[i]].id_huesped },
    defaults: { id_detalle_reservacion: detail.id_detalle_reservacion, id_huesped: huespedes[detailGuests[i]].id_huesped },
  });
}

const reservationServices = [
  { reservation: 0, service: 'Desayuno continental', cantidad: 2 },
  { reservation: 1, service: 'Desayuno continental', cantidad: 4 },
  { reservation: 1, service: 'Masaje relajante', cantidad: 1 },
  { reservation: 2, service: 'Traslado aeropuerto', cantidad: 1 },
  { reservation: 3, service: 'Tour local', cantidad: 2 },
  { reservation: 4, service: 'Cena para dos', cantidad: 1 },
];

for (const data of reservationServices) {
  const service = serviceMap[data.service];
  await ReservacionServicio.findOrCreate({
    where: { id_reservacion: reservations[data.reservation].id_reservacion, id_servicio: service.id_servicio },
    defaults: {
      id_reservacion: reservations[data.reservation].id_reservacion,
      id_servicio: service.id_servicio,
      fecha_servicio: new Date(`${reservationData[data.reservation].entrada}T19:00:00`),
      cantidad: data.cantidad,
      precio_unitario: service.precio,
      subtotal: Number(service.precio) * data.cantidad,
    },
  });
}

const payments = [
  { reservation: 0, monto: 95000, metodo_pago: 'tarjeta', estado: 'confirmado' },
  { reservation: 1, monto: 60000, metodo_pago: 'sinpe', estado: 'confirmado' },
  { reservation: 2, monto: 50000, metodo_pago: 'transferencia', estado: 'confirmado' },
  { reservation: 3, monto: 40000, metodo_pago: 'efectivo', estado: 'pendiente' },
  { reservation: 4, monto: 20000, metodo_pago: 'tarjeta', estado: 'pendiente' },
];

for (const data of payments) {
  await Pago.findOrCreate({
    where: { id_reservacion: reservations[data.reservation].id_reservacion, monto: data.monto, metodo_pago: data.metodo_pago },
    defaults: { id_reservacion: reservations[data.reservation].id_reservacion, fecha_pago: new Date('2026-11-01T12:00:00'), monto: data.monto, metodo_pago: data.metodo_pago, estado: data.estado },
  });
}

const invoiceTotals = [
  { reservation: 0, subtotal: 95000 },
  { reservation: 1, subtotal: 110000 },
  { reservation: 2, subtotal: 80000 },
  { reservation: 3, subtotal: 90000 },
];

for (let i = 0; i < invoiceTotals.length; i++) {
  const data = invoiceTotals[i];
  const impuestos = Number((data.subtotal * 0.13).toFixed(2));
  const total = Number((data.subtotal + impuestos).toFixed(2));
  const [invoice] = await Factura.findOrCreate({
    where: { numero_factura: `DAL-${2026}-${String(i + 1).padStart(4, '0')}` },
    defaults: {
      id_reservacion: reservations[data.reservation].id_reservacion,
      numero_factura: `DAL-${2026}-${String(i + 1).padStart(4, '0')}`,
      fecha_emision: new Date('2026-11-04T15:00:00'),
      subtotal: data.subtotal,
      impuestos,
      total,
      estado: 'emitida',
    },
  });

  const detail = await DetalleFactura.findOne({ where: { id_factura: invoice.id_factura } });
  if (!detail) {
    await DetalleFactura.create({
      id_factura: invoice.id_factura,
      descripcion: 'Hospedaje y servicios',
      cantidad: 1,
      precio_unitario: data.subtotal,
      subtotal: data.subtotal,
    });
  }
}

console.log('Datos de prueba de Dalssi cargados correctamente.');
console.log('Personas: 16 | Clientes: 5 | Huéspedes: 6 | Empleados: 5');
console.log('Puestos: 4 | Habitaciones: 10 | Reservaciones: 6 | Servicios: 8');
console.log('Pagos: 5 | Facturas: 4');
}

run()
  .catch((error) => {
    console.error('Error cargando los datos de prueba:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
