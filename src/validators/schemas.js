import Joi from 'joi';

const schemas = {
    register: Joi.object({
        name: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(100).required(),
        role: Joi.string().valid('viewer', 'analyst', 'admin').default('viewer')
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    createRecord: Joi.object({
        amount: Joi.number().positive().required(),
        type: Joi.string().valid('income', 'expense').required(),
        category: Joi.string().trim().min(1).max(50).required(),
        date: Joi.string().isoDate().required(),
        description: Joi.string().trim().max(500).allow('').optional()
    }),

    updateRecord: Joi.object({
        amount: Joi.number().positive().optional(),
        type: Joi.string().valid('income', 'expense').optional(),
        category: Joi.string().trim().min(1).max(50).optional(),
        date: Joi.string().isoDate().optional(),
        description: Joi.string().trim().max(500).allow('').optional()
    }).min(1),

    updateUser: Joi.object({
        name: Joi.string().trim().min(2).max(100).optional(),
        email: Joi.string().email().optional(),
        role: Joi.string().valid('viewer', 'analyst', 'admin').optional()
    }).min(1),

    updateStatus: Joi.object({
        status: Joi.string().valid('active', 'inactive').required()
    }),

    recordFilters: Joi.object({
        type: Joi.string().valid('income', 'expense').optional(),
        category: Joi.string().optional(),
        date_from: Joi.string().isoDate().optional(),
        date_to: Joi.string().isoDate().optional(),
        search: Joi.string().trim().max(100).optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
    }),

    auditFilters: Joi.object({
        user_id: Joi.string().optional(),
        action: Joi.string().optional(),
        resource: Joi.string().optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20)
    })
};

export default schemas;