import sequelize from '../config/database.js';
import { models } from '../models/index.js';

const { EmpleadosModel, PersonasModel, PuestoModel } = {
  EmpleadosModel: models.empleados,
  PersonasModel: models.personas,
  PuestoModel: models.puesto,
};

export async function list(req, res, next) {
  try {
    const data = await EmpleadosModel.findAll({
      include: [
        { model: PersonasModel, as: 'persona' },
        { model: PuestoModel, as: 'puesto' },
      ],
      order: [['id_empleado', 'ASC']],
    });
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function get(req, res, next) {
  try {
    const data = await EmpleadosModel.findByPk(req.params.id, {
      include: [
        { model: PersonasModel, as: 'persona' },
        { model: PuestoModel, as: 'puesto' },
      ],
    });
    if (!data) return res.status(404).json({ message: 'Empleado no encontrado.' });
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { persona = {}, id_puesto, fecha_contratacion, estado } = req.body;
    const createdPersona = await PersonasModel.create(persona, { transaction });
    const empleado = await EmpleadosModel.create(
      {
        id_persona: createdPersona.id_persona,
        id_puesto,
        fecha_contratacion,
        estado,
      },
      { transaction }
    );
    await transaction.commit();

    const data = await EmpleadosModel.findByPk(empleado.id_empleado, {
      include: [
        { model: PersonasModel, as: 'persona' },
        { model: PuestoModel, as: 'puesto' },
      ],
    });
    res.status(201).json({ message: 'Empleado creado correctamente.', data });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function update(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const empleado = await EmpleadosModel.findByPk(req.params.id, { transaction });
    if (!empleado) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Empleado no encontrado.' });
    }

    const { persona = {}, id_puesto, fecha_contratacion, estado } = req.body;
    const person = await PersonasModel.findByPk(empleado.id_persona, { transaction });
    if (!person) {
      await transaction.rollback();
      return res.status(409).json({ message: 'La persona asociada al empleado no existe.' });
    }

    await person.update(persona, { transaction });
    await empleado.update({ id_puesto, fecha_contratacion, estado }, { transaction });
    await transaction.commit();

    const data = await EmpleadosModel.findByPk(empleado.id_empleado, {
      include: [
        { model: PersonasModel, as: 'persona' },
        { model: PuestoModel, as: 'puesto' },
      ],
    });
    res.json({ message: 'Empleado actualizado correctamente.', data });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const empleado = await EmpleadosModel.findByPk(req.params.id);
    if (!empleado) return res.status(404).json({ message: 'Empleado no encontrado.' });
    await empleado.destroy();
    res.json({ message: 'Empleado eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
}
