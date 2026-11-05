import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PersonasModel = sequelize.define('personas', {
  id_persona: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  identificacion: { type: DataTypes.STRING(15) },
  nombre: { type: DataTypes.STRING(50) },
  apellidos: { type: DataTypes.STRING(60) },
  telefono: { type: DataTypes.STRING(30) },
  correo: { type: DataTypes.STRING(100) },
}, { tableName: 'personas', timestamps: false });

export default PersonasModel;
