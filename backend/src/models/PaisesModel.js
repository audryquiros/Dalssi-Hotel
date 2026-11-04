import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PaisesModel = sequelize.define('paises', {
  id_pais: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100) },
  nacionalidad: { type: DataTypes.STRING(150) },
}, { tableName: 'paises', timestamps: false });

export default PaisesModel;
