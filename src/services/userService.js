import db from '../config/database.js';
import User from '../models/User.js';
import auditService from './auditService.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

const userService = {
    getAllUsers() {
        return User.findAll();
    },

    getUserById(id) {
        const user = User.findById(id);
        if (!user) throw new NotFoundError('User not found');
        return user;
    },

    updateUser(id, fields, requestingUser) {
        const user = User.findById(id);
        if (!user) throw new NotFoundError('User not found');

        if (fields.email) {
            const existing = User.findByEmail(fields.email);
            if (existing && existing.id !== id) {
                throw new ConflictError('Email already in use');
            }
        }

        const updatedUser = User.update(id, fields);
        auditService.log(requestingUser.id, 'UPDATE', 'user', id, fields);
        return updatedUser;
    },

    updateUserStatus(id, status, requestingUser) {
        const user = User.findById(id);
        if (!user) throw new NotFoundError('User not found');

        const updatedUser = User.updateStatus(id, status);
        auditService.log(requestingUser.id, 'UPDATE_STATUS', 'user', id, { status });
        return updatedUser;
    },

    deleteUser(id, requestingUser) {
        const user = User.findById(id);
        if (!user) throw new NotFoundError('User not found');

        if (id === requestingUser.id) {
            throw new ConflictError('Cannot delete your own account');
        }

        const deleteTransaction = db.transaction(() => {
            db.prepare('UPDATE financial_records SET is_deleted = 1 WHERE created_by = ?').run(id);
            db.prepare("UPDATE users SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
        });

        deleteTransaction();
        auditService.log(requestingUser.id, 'DELETE', 'user', id, { deletedUser: user.email });
    }
};

export default userService;