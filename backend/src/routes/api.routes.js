import { Router } from 'express';
import * as controller from '../controllers/crud.controller.js';
import * as empleadosController from '../controllers/empleados.controller.js';
import * as clientesController from '../controllers/clientes.controller.js';
import * as huespedesController from '../controllers/huespedes.controller.js';
import * as dashboardController from '../controllers/dashboard.controller.js';
import * as facturasController from '../controllers/facturas.controller.js';
import * as pagosController from '../controllers/pagos.controller.js';
import * as reservacionesController from '../controllers/reservaciones.controller.js';
import * as authController from '../controllers/auth.controller.js';
import * as clientController from '../controllers/client.controller.js';
import * as usuariosController from '../controllers/usuarios.controller.js';
import { authenticate, authorizeUserType } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', app: 'Dalssi Hotel API' }));
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticate, authController.me);
router.post('/auth/logout', authenticate, authController.logout);

router.use(authenticate);

router.get('/cliente/reservaciones', authorizeUserType('cliente'), clientController.listReservations);
router.get('/cliente/reservaciones/:id', authorizeUserType('cliente'), clientController.getReservation);
router.put('/cliente/reservaciones/:id', authorizeUserType('cliente'), clientController.updateReservation);
router.get('/cliente/reservaciones/:id/factura', authorizeUserType('cliente'), clientController.getInvoice);

router.get('/cliente/habitaciones', authorizeUserType('cliente'), async (req, res, next) => {
  try {
    const { models } = await import('../models/index.js');
    const data = await models.habitaciones.findAll({ include: [{ model: models.tipos_habitacion }], order: [['numero', 'ASC']] });
    res.json({ data });
  } catch (error) { next(error); }
});

router.use(authorizeUserType('empleado'));

router.get('/dashboard', dashboardController.summary);

router.get('/usuarios', usuariosController.list);
router.get('/usuarios/:id', usuariosController.get);
router.post('/usuarios', usuariosController.create);
router.put('/usuarios/:id', usuariosController.update);
router.delete('/usuarios/:id', usuariosController.remove);

router.get('/reservaciones', reservacionesController.list);
router.get('/reservaciones/:id', reservacionesController.get);
router.get('/reservaciones/:id/resumen', reservacionesController.summary);
router.put('/reservaciones/:id/servicios', reservacionesController.replaceServices);
router.put('/reservaciones/:id/habitacion', reservacionesController.replaceRoom);
router.post('/reservaciones', reservacionesController.create);
router.put('/reservaciones/:id', reservacionesController.update);
router.delete('/reservaciones/:id', reservacionesController.remove);

router.get('/pagos/reservaciones-disponibles', pagosController.availableReservations);
router.get('/pagos/reservaciones/:id/resumen', pagosController.reservationSummary);
router.get('/pagos', pagosController.list);
router.get('/pagos/:id', pagosController.get);
router.post('/pagos', pagosController.create);
router.put('/pagos/:id', pagosController.update);
router.delete('/pagos/:id', pagosController.remove);

router.get('/facturas/reservaciones-disponibles', facturasController.availableReservations);
router.get('/facturas', facturasController.list);
router.get('/facturas/:id', facturasController.get);
router.post('/facturas', facturasController.create);
router.put('/facturas/:id', facturasController.update);
router.patch('/facturas/:id/anular', facturasController.cancel);
router.delete('/facturas/:id', facturasController.remove);

router.get('/empleados', empleadosController.list);
router.get('/empleados/:id', empleadosController.get);
router.post('/empleados', empleadosController.create);
router.put('/empleados/:id', empleadosController.update);
router.delete('/empleados/:id', empleadosController.remove);

router.get('/clientes', clientesController.list);
router.get('/clientes/:id', clientesController.get);
router.post('/clientes', clientesController.create);
router.put('/clientes/:id', clientesController.update);
router.delete('/clientes/:id', clientesController.remove);

router.get('/huespedes', huespedesController.list);
router.get('/huespedes/:id', huespedesController.get);
router.post('/huespedes', huespedesController.create);
router.put('/huespedes/:id', huespedesController.update);
router.delete('/huespedes/:id', huespedesController.remove);
router.get('/huespedes-paises', huespedesController.paises);

router.get('/:table', controller.list);
router.get('/:table/:id', controller.get);
router.post('/:table', controller.create);
router.put('/:table/:id', controller.update);
router.delete('/:table/:id', controller.remove);

export default router;
