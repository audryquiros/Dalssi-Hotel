import BaseModel from './BaseModel.js';

// Modelo de acceso a datos para la entidad facturas.
const FacturasModel = new BaseModel('facturas', 'id_factura');
export default FacturasModel;
