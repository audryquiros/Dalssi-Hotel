import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', multipleStatements: true
});
try {
  const sql = await fs.readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  await connection.query(sql);
  console.log(`Base de datos ${process.env.DB_NAME || 'dalssi_hotel'} creada/verificada correctamente.`);
} finally { await connection.end(); }
