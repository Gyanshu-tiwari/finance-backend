import { Router } from 'express';
import { getLogs } from '../controllers/auditController.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/rbac.js';
import { validateQuery } from '../middleware/validate.js';

const router = Router();

router.get('/', auth, authorize('admin'), validateQuery('auditFilters'), getLogs);

export default router;