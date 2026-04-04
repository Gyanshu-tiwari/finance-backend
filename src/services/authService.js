import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { UnauthorizedError, ConflictError } from '../utils/errors.js';

const authService = {
    register({ name, email, password, role }) {
        const existingUser = User.findByEmail(email);
        if (existingUser) {
            throw new ConflictError('Email already registered');
        }

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const passwordHash = bcrypt.hashSync(password, saltRounds);

        const user = User.create({ name, email, passwordHash, role: role || 'viewer' });

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        return { token, user };
    },

    login({ email, password }) {
        const user = User.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        if (user.status !== 'active') {
            throw new UnauthorizedError('Account is inactive');
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        const { password_hash, ...userWithoutPassword } = user;

        return { token, user: userWithoutPassword };
    }
};

export default authService;