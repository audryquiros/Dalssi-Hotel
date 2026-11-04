import PersonasModel from './PersonasModel.js';
import ClientesModel from './ClientesModel.js';
import HuespedesModel from './HuespedesModel.js';
import EmpleadosModel from './EmpleadosModel.js';
import PaisesModel from './PaisesModel.js';
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

// Registro explícito de modelos permitidos por la API.
export const models = {
  personas: PersonasModel,
  clientes: ClientesModel,
  huespedes: HuespedesModel,
  empleados: EmpleadosModel,
  paises: PaisesModel,
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
  detalle_factura: DetalleFacturaModel
};
