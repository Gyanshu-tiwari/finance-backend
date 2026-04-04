import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const AuditLog = {
    create({ userId, action, resource, resourceId, details, ipAddress }) {
        const id = uuidv4();

        db.prepare(`
            INSERT INTO audit_logs (id, user_id, action, resource, resource_id, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, userId, action, resource, resourceId || null, details || null, ipAddress || null);

        return { id, userId, action, resource, resourceId, details, ipAddress };
    },

    findAll(filters = {}) {
        const conditions = [];
        const params = [];

        if (filters.user_id) {
            conditions.push('user_id = ?');
            params.push(filters.user_id);
        }

        if (filters.action) {
            conditions.push('action = ?');
            params.push(filters.action);
        }

        if (filters.resource) {
            conditions.push('resource = ?');
            params.push(filters.resource);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const offset = (page - 1) * limit;

        const total = db.prepare(
            `SELECT COUNT(*) as count FROM audit_logs ${whereClause}`
        ).get(...params).count;

        const data = db.prepare(
            `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
        ).all(...params, limit, offset);

        return { data, total };
    }
};

export default AuditLog;