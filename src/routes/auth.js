import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/register', validate('register'), register);
router.post('/login', validate('login'), login);

export default router;