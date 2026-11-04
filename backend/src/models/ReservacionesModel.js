import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ReservacionesModel = sequelize.define('reservaciones', {
  id_reservacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  id_empleado: { type: DataTypes.INTEGER, allowNull: false },
  fecha_reservacion: { type: DataTypes.DATE },
  fecha_entrada: { type: DataTypes.DATEONLY },
  fecha_salida: { type: DataTypes.DATEONLY },
  estado: { type: DataTypes.ENUM('pendiente', 'confirmada', 'en_curso', 'finalizada', 'cancelada') },
  observaciones: { type: DataTypes.TEXT },
}, { tableName: 'reservaciones', timestamps: false });

export default ReservacionesModel;
