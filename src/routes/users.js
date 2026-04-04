import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, updateStatus, deleteUser } from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', auth, authorize('admin'), getAllUsers);
router.get('/:id', auth, authorize('admin'), getUserById);
router.put('/:id', auth, authorize('admin'), validate('updateUser'), updateUser);
router.patch('/:id/status', auth, authorize('admin'), validate('updateStatus'), updateStatus);
router.delete('/:id', auth, authorize('admin'), deleteUser);

export default router;