import { Router } from 'express';
import * as controller from '../controllers/crud.controller.js';
import * as empleadosController from '../controllers/empleados.controller.js';
import * as clientesController from '../controllers/clientes.controller.js';
import * as huespedesController from '../controllers/huespedes.controller.js';
import * as dashboardController from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', app: 'Dalssi Hotel API' }));
router.get('/dashboard', dashboardController.summary);

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
