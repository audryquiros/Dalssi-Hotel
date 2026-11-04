import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EmpleadosModel = sequelize.define('empleados', {
  id_empleado: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  identificacion: { type: DataTypes.STRING(15) },
  nombre: { type: DataTypes.STRING(50) },
  apellidos: { type: DataTypes.STRING(60) },
  telefono: { type: DataTypes.STRING(30) },
  correo: { type: DataTypes.STRING(100) },
  puesto: { type: DataTypes.STRING(60) },
  fecha_contratacion: { type: DataTypes.DATE },
  estado: { type: DataTypes.ENUM('activo', 'inactivo') },
}, { tableName: 'empleados', timestamps: false });

export default EmpleadosModel;
