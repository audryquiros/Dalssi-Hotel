import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UsuariosModel = sequelize.define('usuarios', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_persona: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  contraseña: { type: DataTypes.STRING(255), allowNull: false },
  fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'usuarios', timestamps: false });

export default UsuariosModel;
