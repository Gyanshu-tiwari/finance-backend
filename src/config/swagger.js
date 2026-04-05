import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Finance Dashboard API',
            version: '1.0.0',
            description:
                'A RESTful backend API for a multi-role finance dashboard system. ' +
                'Supports financial record management, role-based access control, ' +
                'dashboard analytics, and a full audit trail.\n\n' +
                '**Roles:** `viewer` | `analyst` | `admin`\n\n' +
                'Protected routes require a Bearer JWT token obtained from `/api/auth/login`.',
            contact: {
                name: 'Finance Dashboard',
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Local Development Server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Paste the JWT token obtained from /api/auth/login',
                },
            },
            schemas: {
                // ─── Auth ────────────────────────────────────────────────────
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name:     { type: 'string', example: 'Jane Doe' },
                        email:    { type: 'string', format: 'email', example: 'jane@example.com' },
                        password: { type: 'string', minLength: 6, example: 'securepassword' },
                        role:     { type: 'string', enum: ['viewer', 'analyst', 'admin'], default: 'viewer' },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email:    { type: 'string', format: 'email', example: 'admin@example.com' },
                        password: { type: 'string', example: 'admin123' },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'object',
                            properties: {
                                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                                user: { $ref: '#/components/schemas/User' },
                            },
                        },
                    },
                },
                // ─── User ────────────────────────────────────────────────────
                User: {
                    type: 'object',
                    properties: {
                        id:         { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
                        name:       { type: 'string', example: 'Jane Doe' },
                        email:      { type: 'string', example: 'jane@example.com' },
                        role:       { type: 'string', enum: ['viewer', 'analyst', 'admin'] },
                        status:     { type: 'string', enum: ['active', 'inactive'] },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                UpdateUserRequest: {
                    type: 'object',
                    properties: {
                        name:  { type: 'string', example: 'Updated Name' },
                        email: { type: 'string', format: 'email', example: 'new@example.com' },
                        role:  { type: 'string', enum: ['viewer', 'analyst', 'admin'] },
                    },
                },
                UpdateStatusRequest: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: { type: 'string', enum: ['active', 'inactive'] },
                    },
                },
                // ─── Financial Record ─────────────────────────────────────────
                Record: {
                    type: 'object',
                    properties: {
                        id:          { type: 'string', format: 'uuid' },
                        amount:      { type: 'number', example: 50000 },
                        type:        { type: 'string', enum: ['income', 'expense'] },
                        category:    { type: 'string', example: 'Salary' },
                        date:        { type: 'string', format: 'date', example: '2025-04-01' },
                        description: { type: 'string', example: 'Monthly salary for April' },
                        created_by:  { type: 'string', format: 'uuid' },
                        is_deleted:  { type: 'integer', enum: [0, 1] },
                        created_at:  { type: 'string', format: 'date-time' },
                        updated_at:  { type: 'string', format: 'date-time' },
                    },
                },
                CreateRecordRequest: {
                    type: 'object',
                    required: ['amount', 'type', 'category', 'date'],
                    properties: {
                        amount:      { type: 'number', example: 50000 },
                        type:        { type: 'string', enum: ['income', 'expense'] },
                        category:    { type: 'string', example: 'Salary' },
                        date:        { type: 'string', format: 'date', example: '2025-04-01' },
                        description: { type: 'string', example: 'Monthly salary for April' },
                    },
                },
                // ─── Audit Log ────────────────────────────────────────────────
                AuditLog: {
                    type: 'object',
                    properties: {
                        id:          { type: 'string', format: 'uuid' },
                        user_id:     { type: 'string', format: 'uuid' },
                        action:      { type: 'string', enum: ['CREATE', 'UPDATE', 'DELETE', 'UPDATE_STATUS'] },
                        resource:    { type: 'string', example: 'financial_record' },
                        resource_id: { type: 'string' },
                        details:     { type: 'string', description: 'JSON-serialized change payload' },
                        created_at:  { type: 'string', format: 'date-time' },
                    },
                },
                // ─── Shared ───────────────────────────────────────────────────
                Pagination: {
                    type: 'object',
                    properties: {
                        currentPage:  { type: 'integer', example: 1 },
                        totalPages:   { type: 'integer', example: 5 },
                        totalRecords: { type: 'integer', example: 48 },
                        limit:        { type: 'integer', example: 10 },
                        hasNextPage:  { type: 'boolean', example: true },
                        hasPrevPage:  { type: 'boolean', example: false },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error:   { type: 'string', example: 'Unauthorized' },
                    },
                },
            },
        },
        tags: [
            { name: 'Auth',      description: 'Register and login' },
            { name: 'Users',     description: 'User management (Admin only)' },
            { name: 'Records',   description: 'Financial record CRUD and export' },
            { name: 'Dashboard', description: 'Analytics and aggregation' },
            { name: 'Audit',     description: 'Audit log queries (Admin only)' },
            { name: 'System',    description: 'Health check and API docs' },
        ],
    },
    apis: [
        join(__dirname, '../routes/*.js'),
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
