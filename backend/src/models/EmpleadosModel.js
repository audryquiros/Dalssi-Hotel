import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EmpleadosModel = sequelize.define('empleados', {
  id_empleado: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_persona: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  id_puesto: { type: DataTypes.INTEGER, allowNull: false },
  fecha_contratacion: { type: DataTypes.DATE },
  estado: { type: DataTypes.ENUM('activo', 'inactivo') },
}, { tableName: 'empleados', timestamps: false });

export default EmpleadosModel;
