import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import recordRoutes from './routes/records.js';
import dashboardRoutes from './routes/dashboard.js';
import auditRoutes from './routes/audit.js';
import docsRoutes from './routes/docs.js';

import errorHandler from './middleware/errorHandler.js';
import db from './config/database.js';
import swaggerSpec from './config/swagger.js';

const app = express();

// Relax helmet CSP so Swagger UI assets load correctly
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc:  ["'self'", "'unsafe-inline'"],
                styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                imgSrc:     ["'self'", 'data:', 'https://validator.swagger.io'],
                fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
            },
        },
    })
);

// Swagger UI — must be before rate limiter
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Finance Dashboard API Docs',
    swaggerOptions: { persistAuthorization: true },
}));

// Raw OpenAPI JSON spec
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});



app.use(cors({
    origin: process.env.ALLOWED_ORIGINS || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));

app.use(express.json());

const globalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: { success: false, error: 'Too many requests. Please try again later.' },
    skip: (req) => req.path.startsWith('/auth')
});

const authLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
    message: { success: false, error: 'Too many login attempts. Please try again later.' }
});

app.use('/api/auth', authLimiter);
app.use('/api', globalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/docs', docsRoutes);

app.get('/api/health', (req, res) => {
    try {
        db.prepare('SELECT 1').get();
        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected',
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
            }
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            database: 'disconnected'
        });
    }
});

app.use(errorHandler);

export default app;