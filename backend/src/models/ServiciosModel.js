import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ServiciosModel = sequelize.define('servicios', {
  id_servicio: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_categoria_servicio: { type: DataTypes.INTEGER, allowNull: false },
  nombre: { type: DataTypes.STRING(100) },
  descripcion: { type: DataTypes.TEXT },
  precio: { type: DataTypes.DECIMAL(10, 2) },
  estado: { type: DataTypes.ENUM('activo', 'inactivo') },
}, { tableName: 'servicios', timestamps: false });

export default ServiciosModel;
