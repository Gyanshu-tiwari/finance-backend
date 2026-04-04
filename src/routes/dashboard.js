import { Router } from 'express';
import { getSummary, getCategoryBreakdown, getMonthlyTrends, getRecentActivity } from '../controllers/dashboardController.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/rbac.js';

const router = Router();

router.get('/summary', auth, authorize('admin', 'analyst'), getSummary);
router.get('/categories', auth, authorize('admin', 'analyst'), getCategoryBreakdown);
router.get('/trends', auth, authorize('admin', 'analyst'), getMonthlyTrends);
router.get('/recent', auth, authorize('admin', 'analyst', 'viewer'), getRecentActivity);

export default router;