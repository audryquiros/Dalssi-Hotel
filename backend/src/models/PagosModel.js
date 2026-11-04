import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PagosModel = sequelize.define('pagos', {
  id_pago: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_reservacion: { type: DataTypes.INTEGER, allowNull: false },
  fecha_pago: { type: DataTypes.DATE },
  monto: { type: DataTypes.DECIMAL(10, 2) },
  metodo_pago: { type: DataTypes.ENUM('sinpe', 'transferencia', 'tarjeta', 'efectivo') },
  estado: { type: DataTypes.ENUM('pendiente', 'confirmado', 'rechazado', 'anulado') },
}, { tableName: 'pagos', timestamps: false });

export default PagosModel;
