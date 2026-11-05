import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PuestoModel = sequelize.define('puesto', {
  id_puesto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(60), allowNull: false, unique: true },
}, { tableName: 'puesto', timestamps: false });

export default PuestoModel;
