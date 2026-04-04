import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const User = {
    findAll() {
        return db.prepare(
            'SELECT id, name, email, role, status, created_at, updated_at FROM users'
        ).all();
    },

    findById(id) {
        return db.prepare(
            'SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = ?'
        ).get(id);
    },

    findByEmail(email) {
        return db.prepare(
            'SELECT id, name, email, password_hash, role, status, created_at, updated_at FROM users WHERE email = ?'
        ).get(email);
    },

    create({ name, email, passwordHash, role }) {
        const id = uuidv4();

        db.prepare(`
            INSERT INTO users (id, name, email, password_hash, role, status)
            VALUES (?, ?, ?, ?, ?, 'active')
        `).run(id, name, email, passwordHash, role);

        return this.findById(id);
    },

    update(id, fields) {
        const allowedFields = { name: 'name', email: 'email', role: 'role' };
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
            UPDATE users SET ${setClauses.join(', ')} WHERE id = ?
        `).run(...params);

        return this.findById(id);
    },

    updateStatus(id, status) {
        db.prepare(`
            UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `).run(status, id);

        return this.findById(id);
    }
};

export default User;