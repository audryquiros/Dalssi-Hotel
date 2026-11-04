import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ReservacionServiciosModel = sequelize.define('reservacion_servicios', {
  id_reservacion_servicio: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_reservacion: { type: DataTypes.INTEGER, allowNull: false },
  id_servicio: { type: DataTypes.INTEGER, allowNull: false },
  fecha_servicio: { type: DataTypes.DATE },
  cantidad: { type: DataTypes.INTEGER },
  precio_unitario: { type: DataTypes.DECIMAL(10, 2) },
  subtotal: { type: DataTypes.DECIMAL(10, 2) },
}, { tableName: 'reservacion_servicios', timestamps: false });

export default ReservacionServiciosModel;
