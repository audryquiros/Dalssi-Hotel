import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DetalleFacturaModel = sequelize.define('detalle_factura', {
  id_detalle_factura: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_factura: { type: DataTypes.INTEGER, allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  cantidad: { type: DataTypes.INTEGER },
  precio_unitario: { type: DataTypes.DECIMAL(10, 2) },
  subtotal: { type: DataTypes.DECIMAL(10, 2) },
}, { tableName: 'detalle_factura', timestamps: false });

export default DetalleFacturaModel;
