import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FacturasModel = sequelize.define('facturas', {
  id_factura: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_reservacion: { type: DataTypes.INTEGER, allowNull: false },
  numero_factura: { type: DataTypes.STRING(30), unique: true },
  fecha_emision: { type: DataTypes.DATE },
  subtotal: { type: DataTypes.DECIMAL(10, 2) },
  impuestos: { type: DataTypes.DECIMAL(10, 2) },
  total: { type: DataTypes.DECIMAL(10, 2) },
  estado: { type: DataTypes.ENUM('emitida', 'anulada') },
}, { tableName: 'facturas', timestamps: false });

export default FacturasModel;
