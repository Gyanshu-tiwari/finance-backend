import auditService from '../services/auditService.js';
import { sendPaginated } from '../utils/response.js';

const getLogs = (req, res, next) => {
    try {
        const { data, pagination } = auditService.getLogs(req.query);
        sendPaginated(res, data, pagination);
    } catch (error) {
        next(error);
    }
};

export { getLogs };