import bcrypt from 'bcryptjs';
import { models } from '../models/index.js';
import { createToken } from '../utils/jwt.js';
import sequelize from '../config/database.js';

const { PersonasModel, UsuariosModel, ClientesModel, EmpleadosModel, PuestoModel } = {
  PersonasModel: models.personas,
  UsuariosModel: models.usuarios,
  ClientesModel: models.clientes,
  EmpleadosModel: models.empleados,
  PuestoModel: models.puesto,
};

function cleanUser(usuario) {
  if (!usuario) return null;
  const data = usuario.toJSON ? usuario.toJSON() : usuario;
  delete data.contraseña;
  delete data.password;
  return data;
}

async function buildSession(usuario) {
  const persona = await PersonasModel.findByPk(usuario.id_persona, {
    attributes: ['id_persona', 'identificacion', 'nombre', 'apellidos', 'telefono', 'correo', 'estado'],
    include: [
      { model: ClientesModel, as: 'clientes', attributes: ['id_cliente'] },
      { model: EmpleadosModel, as: 'empleado', attributes: ['id_empleado', 'id_puesto', 'estado'], include: [{ model: PuestoModel, as: 'puesto', attributes: ['id_puesto', 'nombre'] }] },
    ],
  });

  const employee = persona?.empleado;
  const puesto = employee?.puesto?.nombre || null;
  let id_cliente = persona?.clientes?.[0]?.id_cliente || null;
  const id_empleado = employee?.id_empleado || null;

  // Compatibilidad con cuentas creadas antes de separar las interfaces:
  // si no existe una relación de empleado ni cliente, la cuenta pública se convierte en cliente.
  if (!id_empleado && !id_cliente) {
    const createdClient = await ClientesModel.create({
      id_persona: usuario.id_persona,
      fecha_registro: new Date(),
      estado: 'activo',
    });
    id_cliente = createdClient.id_cliente;
  }

  const tipo_usuario = id_empleado ? 'empleado' : id_cliente ? 'cliente' : null;
  const payload = {
    id_usuario: usuario.id_usuario,
    id_persona: usuario.id_persona,
    correo: persona?.correo || null,
    puesto,
    id_cliente,
    id_empleado,
    tipo_usuario,
  };

  return {
    token: createToken(payload),
    user: {
      id_usuario: usuario.id_usuario,
      id_persona: usuario.id_persona,
      nombre: persona?.nombre || '',
      apellidos: persona?.apellidos || '',
      correo: persona?.correo || '',
      puesto,
      id_cliente,
      id_empleado,
      tipo_usuario,
    },
  };
}

function setAuthCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `dalssi_token=${encodeURIComponent(token)}; HttpOnly; Path=/api; SameSite=Lax; Max-Age=7200${secure}`);
}

export function clearAuthCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `dalssi_token=; HttpOnly; Path=/api; SameSite=Lax; Max-Age=0${secure}`);
}

export async function register(req, res, next) {
  try {
    const { nombre, apellidos, correo, password, id_persona } = req.body;
    const email = String(correo || '').trim().toLowerCase();
    const rawPassword = String(password || '');

    if (!email || !rawPassword) return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'El correo no tiene un formato válido.' });
    if (rawPassword.length < 8) return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });

    const transaction = await sequelize.transaction();
    let persona = id_persona
      ? await PersonasModel.findByPk(id_persona, { transaction })
      : await PersonasModel.findOne({ where: { correo: email }, transaction });

    if (persona && persona.correo && persona.correo.toLowerCase() !== email) {
      await transaction.rollback();
      return res.status(400).json({ message: 'El correo no coincide con la persona seleccionada.' });
    }

    if (!persona) {
      if (!nombre || !apellidos) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Nombre y apellidos son obligatorios para registrar una persona nueva.' });
      }
      persona = await PersonasModel.create({ nombre: String(nombre).trim(), apellidos: String(apellidos).trim(), correo: email, estado: 'activo' }, { transaction });
    }

    if (persona.estado === 'inactivo') {
      await transaction.rollback();
      return res.status(409).json({ message: 'La persona está inactiva y no puede crear una cuenta.' });
    }

    const existing = await UsuariosModel.findOne({ where: { id_persona: persona.id_persona }, transaction });
    if (existing) {
      await transaction.rollback();
      return res.status(409).json({ message: 'Esta persona ya tiene una cuenta de usuario.' });
    }

    const existingEmployee = await EmpleadosModel.findOne({ where: { id_persona: persona.id_persona }, transaction });
    const existingClient = await ClientesModel.findOne({ where: { id_persona: persona.id_persona }, transaction });

    // El registro público crea una cuenta de cliente cuando la persona todavía no pertenece a un tipo de usuario.
    if (!existingEmployee && !existingClient) {
      await ClientesModel.create({
        id_persona: persona.id_persona,
        fecha_registro: new Date(),
        estado: 'activo',
      }, { transaction });
    }

    const hash = await bcrypt.hash(rawPassword, 10);
    const usuario = await UsuariosModel.create({ id_persona: persona.id_persona, contraseña: hash }, { transaction });
    await transaction.commit();

    const session = await buildSession(usuario);
    setAuthCookie(res, session.token);
    res.status(201).json({ message: 'Cuenta registrada correctamente.', user: session.user });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const email = String(req.body.correo || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });

    const persona = await PersonasModel.findOne({ where: { correo: email } });
    if (!persona || persona.estado === 'inactivo') return res.status(401).json({ message: 'Credenciales inválidas.' });

    const usuario = await UsuariosModel.findOne({ where: { id_persona: persona.id_persona } });
    if (!usuario) return res.status(401).json({ message: 'La persona no tiene una cuenta registrada.' });

    const valid = await bcrypt.compare(password, usuario.contraseña);
    if (!valid) return res.status(401).json({ message: 'Credenciales inválidas.' });

    const session = await buildSession(usuario);
    setAuthCookie(res, session.token);
    res.json({ message: 'Inicio de sesión correcto.', user: session.user });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  clearAuthCookie(res);
  res.json({ message: 'Sesión cerrada correctamente.' });
}

export async function me(req, res, next) {
  try {
    const usuario = await UsuariosModel.findByPk(req.user.id_usuario);
    if (!usuario) return res.status(401).json({ message: 'La cuenta ya no existe.' });
    const session = await buildSession(usuario);
    res.json({ user: session.user });
  } catch (error) {
    next(error);
  }
}
