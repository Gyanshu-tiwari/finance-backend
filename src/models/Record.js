import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const Record = {
    create({ amount, type, category, date, description, createdBy }) {
        const id = uuidv4();

        db.prepare(`
            INSERT INTO financial_records (id, amount, type, category, date, description, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, amount, type, category, date, description || null, createdBy);

        return this.findById(id);
    },

    findById(id) {
        return db.prepare(
            'SELECT * FROM financial_records WHERE id = ? AND is_deleted = 0'
        ).get(id);
    },

    findAll(filters = {}) {
        const conditions = ['is_deleted = 0'];
        const params = [];

        if (filters.type) {
            conditions.push('type = ?');
            params.push(filters.type);
        }

        if (filters.category) {
            conditions.push('category = ?');
            params.push(filters.category);
        }

        if (filters.date_from) {
            conditions.push('date >= ?');
            params.push(filters.date_from);
        }

        if (filters.date_to) {
            conditions.push('date <= ?');
            params.push(filters.date_to);
        }

        if (filters.search) {
            conditions.push('(description LIKE ? OR category LIKE ?)');
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        const whereClause = conditions.join(' AND ');

        const total = db.prepare(
            `SELECT COUNT(*) as count FROM financial_records WHERE ${whereClause}`
        ).get(...params).count;

        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 10;
        const offset = (page - 1) * limit;

        const data = db.prepare(
            `SELECT * FROM financial_records WHERE ${whereClause} ORDER BY date DESC LIMIT ? OFFSET ?`
        ).all(...params, limit, offset);

        return { data, total };
    },

    update(id, fields) {
        const allowedFields = { amount: 'amount', type: 'type', category: 'category', date: 'date', description: 'description' };
        const setClauses = [];
        const params = [];

        for (const [key, column] of Object.entries(allowedFields)) {
            if (fields[key] !== undefined) {
                setClauses.push(`${column} = ?`);
                params.push(fields[key]);
            }
        }

        if (setClauses.length === 0) return this.findById(id);

        setClauses.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        db.prepare(`
            UPDATE financial_records SET ${setClauses.join(', ')} WHERE id = ? AND is_deleted = 0
        `).run(...params);

        return this.findById(id);
    },

    softDelete(id) {
        db.prepare(`
            UPDATE financial_records SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `).run(id);
    },

    getSummary() {
        const income = db.prepare(
            'SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = ? AND is_deleted = 0'
        ).get('income').total;

        const expenses = db.prepare(
            'SELECT COALESCE(SUM(amount), 0) as total FROM financial_records WHERE type = ? AND is_deleted = 0'
        ).get('expense').total;

        const recordCount = db.prepare(
            'SELECT COUNT(*) as count FROM financial_records WHERE is_deleted = 0'
        ).get().count;

        return {
            totalIncome: income,
            totalExpenses: expenses,
            netBalance: income - expenses,
            recordCount
        };
    },

    getCategoryBreakdown() {
        return db.prepare(`
            SELECT category, type, SUM(amount) as total, COUNT(*) as count
            FROM financial_records
            WHERE is_deleted = 0
            GROUP BY category, type
            ORDER BY total DESC
        `).all();
    },

    getMonthlyTrends() {
        return db.prepare(`
            SELECT strftime('%Y-%m', date) as month, type, SUM(amount) as total
            FROM financial_records
            WHERE is_deleted = 0
            GROUP BY month, type
            ORDER BY month ASC
        `).all();
    },

    getRecent(limit = 10) {
        return db.prepare(
            'SELECT * FROM financial_records WHERE is_deleted = 0 ORDER BY date DESC LIMIT ?'
        ).all(limit);
    }
};

export default Record;