import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'dalssi_hotel',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  { host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306), dialect: 'mysql', logging: false, timezone: '-06:00', define: { freezeTableName: true, timestamps: false } }
);

export async function testConnection() { await sequelize.authenticate(); }
export default sequelize;
