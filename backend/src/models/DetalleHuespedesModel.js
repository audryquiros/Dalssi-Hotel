import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DetalleHuespedesModel = sequelize.define('detalle_huespedes', {
  id_detalle_huesped: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_detalle_reservacion: { type: DataTypes.INTEGER, allowNull: false },
  id_huesped: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'detalle_huespedes', timestamps: false });

export default DetalleHuespedesModel;
