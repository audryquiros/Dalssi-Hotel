import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TiposHabitacionModel = sequelize.define('tipos_habitacion', {
  id_tipo_habitacion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100) },
  descripcion: { type: DataTypes.TEXT },
  capacidad: { type: DataTypes.INTEGER },
  precio_base: { type: DataTypes.DECIMAL(10, 2) },
}, { tableName: 'tipos_habitacion', timestamps: false });

export default TiposHabitacionModel;
