import sequelize from '../config/database.js';
import { models } from '../models/index.js';

const { HuespedesModel, PersonasModel, PaisesModel } = {
  HuespedesModel: models.huespedes,
  PersonasModel: models.personas,
  PaisesModel: models.paises,
};

const includes = [
  { model: PersonasModel, as: 'persona' },
  { model: PaisesModel, as: 'pais' },
];

export async function list(req, res, next) {
  try {
    const data = await HuespedesModel.findAll({ include: includes, order: [['id_huesped', 'ASC']] });
    res.json({ data });
  } catch (error) { next(error); }
}

export async function get(req, res, next) {
  try {
    const data = await HuespedesModel.findByPk(req.params.id, { include: includes });
    if (!data) return res.status(404).json({ message: 'Huésped no encontrado.' });
    res.json({ data });
  } catch (error) { next(error); }
}

export async function create(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { persona = {}, id_pais, estado = 'activo' } = req.body;
    const createdPersona = await PersonasModel.create({ ...persona, estado }, { transaction });
    const huesped = await HuespedesModel.create({ id_persona: createdPersona.id_persona, id_pais, estado }, { transaction });
    await transaction.commit();
    const data = await HuespedesModel.findByPk(huesped.id_huesped, { include: includes });
    res.status(201).json({ message: 'Huésped creado correctamente.', data });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function update(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const huesped = await HuespedesModel.findByPk(req.params.id, { transaction });
    if (!huesped) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Huésped no encontrado.' });
    }
    const { persona = {}, id_pais, estado } = req.body;
    const person = await PersonasModel.findByPk(huesped.id_persona, { transaction });
    if (!person) {
      await transaction.rollback();
      return res.status(409).json({ message: 'La persona asociada al huésped no existe.' });
    }
    await person.update(persona, { transaction });
    await huesped.update({ id_pais, ...(estado ? { estado } : {}) }, { transaction });
    if (estado === 'inactivo') await person.update({ estado: 'inactivo' }, { transaction });
    if (estado === 'activo') await person.update({ estado: 'activo' }, { transaction });
    await transaction.commit();
    const data = await HuespedesModel.findByPk(huesped.id_huesped, { include: includes });
    res.json({ message: 'Huésped actualizado correctamente.', data });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function remove(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const huesped = await HuespedesModel.findByPk(req.params.id, { transaction });
    if (!huesped) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Huésped no encontrado.' });
    }
    const person = await PersonasModel.findByPk(huesped.id_persona, { transaction });
    await huesped.update({ estado: 'inactivo' }, { transaction });
    if (person) await person.update({ estado: 'inactivo' }, { transaction });
    await transaction.commit();
    res.json({ message: 'Huésped inactivado correctamente. El historial se conserva.' });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function paises(req, res, next) {
  try {
    const data = await PaisesModel.findAll({ order: [['nombre', 'ASC']] });
    res.json({ data });
  } catch (error) { next(error); }
}
