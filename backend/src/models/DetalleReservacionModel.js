import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DetalleReservacionModel = sequelize.define('detalle_reservacion', {
  id_detalle_reservacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_reservacion: { type: DataTypes.INTEGER, allowNull: false },
  id_habitacion: { type: DataTypes.INTEGER, allowNull: false },
  precio_noche: { type: DataTypes.DECIMAL(10, 2) },
}, { tableName: 'detalle_reservacion', timestamps: false });

export default DetalleReservacionModel;
