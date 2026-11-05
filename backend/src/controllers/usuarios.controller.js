import bcrypt from 'bcryptjs';
import { models } from '../models/index.js';

const Usuarios = models.usuarios;
const Personas = models.personas;

function publicUser(row) {
  const data = row.toJSON ? row.toJSON() : row;
  delete data.contraseña;
  delete data.password;
  return data;
}

export async function list(req, res, next) {
  try {
    const rows = await Usuarios.findAll({
      attributes: ['id_usuario', 'id_persona', 'fecha_creacion'],
      include: [{ model: Personas, as: 'persona', attributes: ['id_persona', 'nombre', 'apellidos', 'correo', 'estado'] }],
      order: [['id_usuario', 'DESC']],
    });
    res.json({ data: rows });
  } catch (error) { next(error); }
}

export async function get(req, res, next) {
  try {
    const row = await Usuarios.findByPk(req.params.id, {
      attributes: ['id_usuario', 'id_persona', 'fecha_creacion'],
      include: [{ model: Personas, as: 'persona', attributes: ['id_persona', 'nombre', 'apellidos', 'correo', 'estado'] }],
    });
    if (!row) return res.status(404).json({ message: 'Usuario no encontrado.' });
    res.json({ data: row });
  } catch (error) { next(error); }
}

export async function create(req, res, next) {
  try {
    const { id_persona, password, contraseña } = req.body;
    if (!id_persona || !(password || contraseña)) return res.status(400).json({ message: 'id_persona y contraseña son obligatorios.' });
    const person = await Personas.findByPk(id_persona);
    if (!person) return res.status(404).json({ message: 'La persona indicada no existe.' });
    const existing = await Usuarios.findOne({ where: { id_persona } });
    if (existing) return res.status(409).json({ message: 'La persona ya tiene un usuario.' });
    const hash = await bcrypt.hash(String(password || contraseña), 10);
    const row = await Usuarios.create({ id_persona, contraseña: hash });
    res.status(201).json({ message: 'Usuario creado correctamente.', data: publicUser(row) });
  } catch (error) { next(error); }
}

export async function update(req, res, next) {
  try {
    const row = await Usuarios.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Usuario no encontrado.' });
    if (req.body.id_persona && Number(req.body.id_persona) !== Number(row.id_persona)) {
      const existing = await Usuarios.findOne({ where: { id_persona: req.body.id_persona } });
      if (existing) return res.status(409).json({ message: 'La persona ya tiene otro usuario.' });
      const person = await Personas.findByPk(req.body.id_persona);
      if (!person) return res.status(404).json({ message: 'La persona indicada no existe.' });
      row.id_persona = req.body.id_persona;
    }
    if (req.body.password || req.body.contraseña) row.contraseña = await bcrypt.hash(String(req.body.password || req.body.contraseña), 10);
    await row.save();
    res.json({ message: 'Usuario actualizado correctamente.', data: publicUser(row) });
  } catch (error) { next(error); }
}

export async function remove(req, res, next) {
  try {
    const row = await Usuarios.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Usuario no encontrado.' });
    await row.destroy();
    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) { next(error); }
}
