import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ClientesModel = sequelize.define('clientes', {
  id_cliente: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_persona: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  direccion: { type: DataTypes.STRING(255) },
  fecha_registro: { type: DataTypes.DATE },
  estado: { type: DataTypes.ENUM('activo', 'inactivo'), allowNull: false, defaultValue: 'activo' },
}, { tableName: 'clientes', timestamps: false });

export default ClientesModel;
