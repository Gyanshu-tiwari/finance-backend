import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.json({
        name: 'Finance Dashboard API',
        version: '1.0.0',
        description: 'Backend API for finance dashboard with role-based access control',
        endpoints: {
            auth: [
                { method: 'POST', path: '/api/auth/register', access: 'Public', body: 'name, email, password, role' },
                { method: 'POST', path: '/api/auth/login', access: 'Public', body: 'email, password' }
            ],
            users: [
                { method: 'GET', path: '/api/users', access: 'Admin', description: 'List all users' },
                { method: 'GET', path: '/api/users/:id', access: 'Admin', description: 'Get user by ID' },
                { method: 'PUT', path: '/api/users/:id', access: 'Admin', body: 'name, email, role' },
                { method: 'PATCH', path: '/api/users/:id/status', access: 'Admin', body: 'status' },
                { method: 'DELETE', path: '/api/users/:id', access: 'Admin', description: 'Deactivate user' }
            ],
            records: [
                { method: 'POST', path: '/api/records', access: 'Admin', body: 'amount, type, category, date, description' },
                { method: 'GET', path: '/api/records', access: 'Admin, Analyst, Viewer', query: 'type, category, date_from, date_to, search, page, limit' },
                { method: 'GET', path: '/api/records/export', access: 'Admin, Analyst', description: 'Export records as CSV' },
                { method: 'GET', path: '/api/records/:id', access: 'Admin, Analyst, Viewer', description: 'Get record by ID' },
                { method: 'PUT', path: '/api/records/:id', access: 'Admin', body: 'amount, type, category, date, description' },
                { method: 'DELETE', path: '/api/records/:id', access: 'Admin', description: 'Soft delete record' }
            ],
            dashboard: [
                { method: 'GET', path: '/api/dashboard/summary', access: 'Admin, Analyst', description: 'Total income, expenses, net balance' },
                { method: 'GET', path: '/api/dashboard/categories', access: 'Admin, Analyst', description: 'Category-wise breakdown' },
                { method: 'GET', path: '/api/dashboard/trends', access: 'Admin, Analyst', description: 'Monthly income/expense trends' },
                { method: 'GET', path: '/api/dashboard/recent', access: 'Admin, Analyst, Viewer', query: 'limit' }
            ],
            audit: [
                { method: 'GET', path: '/api/audit-logs', access: 'Admin', query: 'user_id, action, resource, page, limit' }
            ],
            system: [
                { method: 'GET', path: '/api/health', access: 'Public', description: 'Health check with DB status' },
                { method: 'GET', path: '/api/docs', access: 'Public', description: 'This documentation' }
            ]
        },
        roles: {
            viewer: 'Can view records and recent activity',
            analyst: 'Can view records, access dashboard summaries and trends',
            admin: 'Full access to all resources including user management'
        },
        authentication: 'Send JWT token in Authorization header as: Bearer <token>'
    });
});

export default router;