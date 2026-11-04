import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CategoriasServiciosModel = sequelize.define('categorias_servicios', {
  id_categoria_servicio: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(50) },
  descripcion: { type: DataTypes.TEXT },
  estado: { type: DataTypes.ENUM('activo', 'inactivo') },
}, { tableName: 'categorias_servicios', timestamps: false });

export default CategoriasServiciosModel;
