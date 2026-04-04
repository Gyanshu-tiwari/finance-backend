import { Router } from 'express';
import { create, getAll, getById, update, remove, exportRecords } from '../controllers/recordController.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/rbac.js';
import { validate, validateQuery } from '../middleware/validate.js';

const router = Router();

router.post('/', auth, authorize('admin'), validate('createRecord'), create);
router.get('/export', auth, authorize('admin', 'analyst'), exportRecords);
router.get('/', auth, authorize('admin', 'analyst', 'viewer'), validateQuery('recordFilters'), getAll);
router.get('/:id', auth, authorize('admin', 'analyst', 'viewer'), getById);
router.put('/:id', auth, authorize('admin'), validate('updateRecord'), update);
router.delete('/:id', auth, authorize('admin'), remove);

export default router;