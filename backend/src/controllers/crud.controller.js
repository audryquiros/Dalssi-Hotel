import { models } from '../models/index.js';

function getModel(table) {
  const model = models[table];
  if (!model) { const error = new Error('Módulo no válido.'); error.status = 404; throw error; }
  return model;
}
export async function list(req, res, next) { try { res.json({ data: await getModel(req.params.table).findAll() }); } catch (e) { next(e); } }
export async function get(req, res, next) { try { const data = await getModel(req.params.table).findById(req.params.id); if (!data) return res.status(404).json({ message: 'Registro no encontrado.' }); res.json({ data }); } catch (e) { next(e); } }
export async function create(req, res, next) { try { const data = await getModel(req.params.table).create(req.body); res.status(201).json({ message: 'Registro creado correctamente.', data }); } catch (e) { next(e); } }
export async function update(req, res, next) { try { const data = await getModel(req.params.table).update(req.params.id, req.body); if (!data) return res.status(404).json({ message: 'Registro no encontrado.' }); res.json({ message: 'Registro actualizado correctamente.', data }); } catch (e) { next(e); } }
export async function remove(req, res, next) { try { const removed = await getModel(req.params.table).delete(req.params.id); if (!removed) return res.status(404).json({ message: 'Registro no encontrado.' }); res.json({ message: 'Registro eliminado correctamente.' }); } catch (e) { next(e); } }
