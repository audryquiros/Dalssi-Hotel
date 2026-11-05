import sequelize from '../config/database.js';
import { models } from '../models/index.js';

const { ClientesModel, PersonasModel } = {
  ClientesModel: models.clientes,
  PersonasModel: models.personas,
};

const includePersona = { model: PersonasModel, as: 'persona' };

export async function list(req, res, next) {
  try {
    const data = await ClientesModel.findAll({ include: [includePersona], order: [['id_cliente', 'ASC']] });
    res.json({ data });
  } catch (error) { next(error); }
}

export async function get(req, res, next) {
  try {
    const data = await ClientesModel.findByPk(req.params.id, { include: [includePersona] });
    if (!data) return res.status(404).json({ message: 'Cliente no encontrado.' });
    res.json({ data });
  } catch (error) { next(error); }
}

export async function create(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { persona = {}, direccion, fecha_registro } = req.body;
    const createdPersona = await PersonasModel.create(persona, { transaction });
    const cliente = await ClientesModel.create({
      id_persona: createdPersona.id_persona,
      direccion,
      fecha_registro: fecha_registro || new Date(),
    }, { transaction });
    await transaction.commit();
    const data = await ClientesModel.findByPk(cliente.id_cliente, { include: [includePersona] });
    res.status(201).json({ message: 'Cliente creado correctamente.', data });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function update(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const cliente = await ClientesModel.findByPk(req.params.id, { transaction });
    if (!cliente) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }
    const { persona = {}, direccion, fecha_registro } = req.body;
    const person = await PersonasModel.findByPk(cliente.id_persona, { transaction });
    if (!person) {
      await transaction.rollback();
      return res.status(409).json({ message: 'La persona asociada al cliente no existe.' });
    }
    await person.update(persona, { transaction });
    await cliente.update({ direccion, fecha_registro }, { transaction });
    await transaction.commit();
    const data = await ClientesModel.findByPk(cliente.id_cliente, { include: [includePersona] });
    res.json({ message: 'Cliente actualizado correctamente.', data });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function remove(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const cliente = await ClientesModel.findByPk(req.params.id, { transaction });
    if (!cliente) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }
    const personId = cliente.id_persona;
    await cliente.destroy({ transaction });
    await PersonasModel.destroy({ where: { id_persona: personId }, transaction });
    await transaction.commit();
    res.json({ message: 'Cliente eliminado correctamente.' });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}
