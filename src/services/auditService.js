import AuditLog from '../models/AuditLog.js';

const auditService = {
    log(userId, action, resource, resourceId = null, details = null, ipAddress = null) {
        try {
            AuditLog.create({
                userId,
                action,
                resource,
                resourceId,
                details: details ? JSON.stringify(details) : null,
                ipAddress
            });
        } catch (error) {
            console.error('Audit log failed:', error.message);
        }
    },

    getLogs(filters) {
        const { data, total } = AuditLog.findAll(filters);
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords: total,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    }
};

export default auditService;