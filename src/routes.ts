import { Router } from 'express';

import AccountController from './Controllers/AccountController';
import AddressController from './Controllers/AddressController';
import CompanyController from './Controllers/CompanyController';
import ProductController from './Controllers/ProductController';
import PurchaseController from './Controllers/PurchaseController';
import ScheduleController from './Controllers/ScheduleController';
import ServiceController from './Controllers/ServiceController';
import SessionController from './Controllers/SessionController';
import ImageController from './Controllers/ImageController';

import authMiddleware from './middlewares/auth';

const routes = Router();

// routes.get('/', AccountController.index);
routes.post('/register', AccountController.create);
routes.post('/session', SessionController.create);

routes.use(authMiddleware);

routes.post('/image', ImageController.create);
routes.put('/image', ImageController.delete);

routes.put('/account', AccountController.updateToken);

routes.get('/products', ProductController.index);
routes.post('/product', ProductController.create);
routes.put('/product', ProductController.update);

routes.get('/companies', CompanyController.index);
routes.get('/company/:id', CompanyController.find);
routes.put('/company', CompanyController.update);

routes.get('/services', ServiceController.index);
routes.post('/service', ServiceController.create);
routes.put('/service', ServiceController.update);

routes.get('/purchases', PurchaseController.index);
routes.post('/purchase', PurchaseController.create);

routes.get('/agenda/:id', ScheduleController.index);
routes.post('/agenda', ScheduleController.create);
routes.put('/agenda', ScheduleController.update);

routes.get('/address/:account', AddressController.index);
routes.post('/address', AddressController.create);

export { routes };
