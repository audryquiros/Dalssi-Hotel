import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dalssi_hotel',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true
};

export const pool = mysql.createPool(config);
export async function testConnection() {
  const connection = await pool.getConnection();
  try { await connection.query('SELECT 1'); }
  finally { connection.release(); }
}
