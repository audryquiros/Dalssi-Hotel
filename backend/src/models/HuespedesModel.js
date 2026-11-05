import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HuespedesModel = sequelize.define('huespedes', {
  id_huesped: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_persona: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  id_pais: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'huespedes', timestamps: false });

export default HuespedesModel;
