import authService from '../services/authService.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

const register = (req, res, next) => {
    try {
        const result = authService.register(req.body);
        sendCreated(res, result);
    } catch (error) {
        next(error);
    }
};

const login = (req, res, next) => {
    try {
        const result = authService.login(req.body);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
};

export { register, login };