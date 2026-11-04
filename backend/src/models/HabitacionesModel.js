import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HabitacionesModel = sequelize.define('habitaciones', {
  id_habitacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_tipo_habitacion: { type: DataTypes.INTEGER, allowNull: false },
  numero: { type: DataTypes.STRING(10), unique: true },
  piso: { type: DataTypes.INTEGER },
  ubicacion: { type: DataTypes.STRING(255) },
  descripcion: { type: DataTypes.TEXT },
  estado: { type: DataTypes.ENUM('disponible', 'ocupada', 'mantenimiento', 'limpieza') },
}, { tableName: 'habitaciones', timestamps: false });

export default HabitacionesModel;
