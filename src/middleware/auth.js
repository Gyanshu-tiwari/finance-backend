import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { UnauthorizedError } from '../utils/errors.js';

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = User.findById(decoded.userId);

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        if (user.status !== 'active') {
            throw new UnauthorizedError('Account is inactive');
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            next(error);
        } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            next(new UnauthorizedError('Invalid or expired token'));
        } else {
            next(error);
        }
    }
};

export default auth;