import PersonasModel from './PersonasModel.js';
import ClientesModel from './ClientesModel.js';
import PaisesModel from './PaisesModel.js';
import HuespedesModel from './HuespedesModel.js';
import EmpleadosModel from './EmpleadosModel.js';
import TiposHabitacionModel from './TiposHabitacionModel.js';
import HabitacionesModel from './HabitacionesModel.js';
import ReservacionesModel from './ReservacionesModel.js';
import DetalleReservacionModel from './DetalleReservacionModel.js';
import DetalleHuespedesModel from './DetalleHuespedesModel.js';
import CategoriasServiciosModel from './CategoriasServiciosModel.js';
import ServiciosModel from './ServiciosModel.js';
import ReservacionServiciosModel from './ReservacionServiciosModel.js';
import PagosModel from './PagosModel.js';
import FacturasModel from './FacturasModel.js';
import DetalleFacturaModel from './DetalleFacturaModel.js';
export const models = {
  personas: PersonasModel,
  clientes: ClientesModel,
  paises: PaisesModel,
  huespedes: HuespedesModel,
  empleados: EmpleadosModel,
  tipos_habitacion: TiposHabitacionModel,
  habitaciones: HabitacionesModel,
  reservaciones: ReservacionesModel,
  detalle_reservacion: DetalleReservacionModel,
  detalle_huespedes: DetalleHuespedesModel,
  categorias_servicios: CategoriasServiciosModel,
  servicios: ServiciosModel,
  reservacion_servicios: ReservacionServiciosModel,
  pagos: PagosModel,
  facturas: FacturasModel,
  detalle_factura: DetalleFacturaModel,
};

PersonasModel.hasMany(ClientesModel, { foreignKey: 'id_persona', as: 'clientes' });
ClientesModel.belongsTo(PersonasModel, { foreignKey: 'id_persona' });
PersonasModel.hasMany(HuespedesModel, { foreignKey: 'id_persona', as: 'huespedes' });
HuespedesModel.belongsTo(PersonasModel, { foreignKey: 'id_persona' });
PaisesModel.hasMany(HuespedesModel, { foreignKey: 'id_pais', as: 'huespedes' });
HuespedesModel.belongsTo(PaisesModel, { foreignKey: 'id_pais' });
TiposHabitacionModel.hasMany(HabitacionesModel, { foreignKey: 'id_tipo_habitacion', as: 'habitaciones' });
HabitacionesModel.belongsTo(TiposHabitacionModel, { foreignKey: 'id_tipo_habitacion' });
ClientesModel.hasMany(ReservacionesModel, { foreignKey: 'id_cliente', as: 'reservaciones' });
ReservacionesModel.belongsTo(ClientesModel, { foreignKey: 'id_cliente' });
EmpleadosModel.hasMany(ReservacionesModel, { foreignKey: 'id_empleado', as: 'reservaciones' });
ReservacionesModel.belongsTo(EmpleadosModel, { foreignKey: 'id_empleado' });
ReservacionesModel.hasMany(DetalleReservacionModel, { foreignKey: 'id_reservacion', as: 'detalle_reservacion' });
DetalleReservacionModel.belongsTo(ReservacionesModel, { foreignKey: 'id_reservacion' });
HabitacionesModel.hasMany(DetalleReservacionModel, { foreignKey: 'id_habitacion', as: 'detalle_reservacion' });
DetalleReservacionModel.belongsTo(HabitacionesModel, { foreignKey: 'id_habitacion' });
DetalleReservacionModel.hasMany(DetalleHuespedesModel, { foreignKey: 'id_detalle_reservacion', as: 'detalle_huespedes' });
DetalleHuespedesModel.belongsTo(DetalleReservacionModel, { foreignKey: 'id_detalle_reservacion' });
HuespedesModel.hasMany(DetalleHuespedesModel, { foreignKey: 'id_huesped', as: 'detalle_huespedes' });
DetalleHuespedesModel.belongsTo(HuespedesModel, { foreignKey: 'id_huesped' });
CategoriasServiciosModel.hasMany(ServiciosModel, { foreignKey: 'id_categoria_servicio', as: 'servicios' });
ServiciosModel.belongsTo(CategoriasServiciosModel, { foreignKey: 'id_categoria_servicio' });
ReservacionesModel.hasMany(ReservacionServiciosModel, { foreignKey: 'id_reservacion', as: 'reservacion_servicios' });
ReservacionServiciosModel.belongsTo(ReservacionesModel, { foreignKey: 'id_reservacion' });
ServiciosModel.hasMany(ReservacionServiciosModel, { foreignKey: 'id_servicio', as: 'reservacion_servicios' });
ReservacionServiciosModel.belongsTo(ServiciosModel, { foreignKey: 'id_servicio' });
ReservacionesModel.hasMany(PagosModel, { foreignKey: 'id_reservacion', as: 'pagos' });
PagosModel.belongsTo(ReservacionesModel, { foreignKey: 'id_reservacion' });
ReservacionesModel.hasMany(FacturasModel, { foreignKey: 'id_reservacion', as: 'facturas' });
FacturasModel.belongsTo(ReservacionesModel, { foreignKey: 'id_reservacion' });
FacturasModel.hasMany(DetalleFacturaModel, { foreignKey: 'id_factura', as: 'detalle_factura' });
DetalleFacturaModel.belongsTo(FacturasModel, { foreignKey: 'id_factura' });

