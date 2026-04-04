import { ForbiddenError } from '../utils/errors.js';

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ForbiddenError('User not authenticated'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new ForbiddenError('Insufficient permissions'));
        }

        next();
    };
};

export default authorize;