import { pool } from '../config/database.js';

// Modelo base: concentra las operaciones SQL reutilizables.
export default class BaseModel {
  constructor(table, primaryKey) { this.table = table; this.primaryKey = primaryKey; }
  async findAll() { const [rows] = await pool.query('SELECT * FROM ?? ORDER BY ?? DESC', [this.table, this.primaryKey]); return rows; }
  async findById(id) { const [rows] = await pool.query('SELECT * FROM ?? WHERE ?? = ?', [this.table, this.primaryKey, id]); return rows[0] || null; }
  async create(data) {
    const entries = Object.entries(data || {}).filter(([key, value]) => key !== this.primaryKey && value !== undefined);
    if (!entries.length) { const error = new Error('Debe enviar al menos un campo.'); error.status = 400; throw error; }
    const columns = entries.map(([key]) => key); const values = entries.map(([, value]) => value);
    const sql = `INSERT INTO ?? (${columns.map(() => '??').join(',')}) VALUES (${columns.map(() => '?').join(',')})`;
    const [result] = await pool.query(sql, [this.table, ...columns, ...values]); return this.findById(result.insertId);
  }
  async update(id, data) {
    const entries = Object.entries(data || {}).filter(([key, value]) => key !== this.primaryKey && value !== undefined);
    if (!entries.length) { const error = new Error('Debe enviar campos para actualizar.'); error.status = 400; throw error; }
    const sets = entries.map(() => '?? = ?').join(', ');
    await pool.query(`UPDATE ?? SET ${sets} WHERE ?? = ?`, [this.table, ...entries.flatMap(([key, value]) => [key, value]), this.primaryKey, id]);
    return this.findById(id);
  }
  async delete(id) { const [result] = await pool.query('DELETE FROM ?? WHERE ?? = ?', [this.table, this.primaryKey, id]); return result.affectedRows > 0; }
}
