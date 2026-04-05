import { Router } from 'express';
import { getSummary, getCategoryBreakdown, getMonthlyTrends, getRecentActivity } from '../controllers/dashboardController.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/rbac.js';

const router = Router();

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get financial summary (totals and net balance)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalIncome:   { type: number, example: 250000 }
 *                     totalExpenses: { type: number, example: 87500 }
 *                     netBalance:    { type: number, example: 162500 }
 *                     recordCount:   { type: integer, example: 24 }
 */
router.get('/summary', auth, authorize('admin', 'analyst'), getSummary);

/**
 * @swagger
 * /api/dashboard/categories:
 *   get:
 *     summary: Get amounts grouped by category and type
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Category breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category: { type: string, example: Salary }
 *                       type:     { type: string, enum: [income, expense] }
 *                       total:    { type: number, example: 50000 }
 *                       count:    { type: integer, example: 3 }
 */
router.get('/categories', auth, authorize('admin', 'analyst'), getCategoryBreakdown);

/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     summary: Get monthly income/expense totals
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly trends
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month: { type: string, example: '2025-01' }
 *                       type:  { type: string, enum: [income, expense] }
 *                       total: { type: number, example: 50000 }
 */
router.get('/trends', auth, authorize('admin', 'analyst'), getMonthlyTrends);

/**
 * @swagger
 * /api/dashboard/recent:
 *   get:
 *     summary: Get N most recent financial records
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records to return
 *     responses:
 *       200:
 *         description: Recent records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Record'
 */
router.get('/recent', auth, authorize('admin', 'analyst', 'viewer'), getRecentActivity);

export default router;