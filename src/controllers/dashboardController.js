import dashboardService from '../services/dashboardService.js';
import { sendSuccess } from '../utils/response.js';

const getSummary = (req, res, next) => {
    try {
        const summary = dashboardService.getSummary();
        sendSuccess(res, summary);
    } catch (error) {
        next(error);
    }
};

const getCategoryBreakdown = (req, res, next) => {
    try {
        const categories = dashboardService.getCategoryBreakdown();
        sendSuccess(res, categories);
    } catch (error) {
        next(error);
    }
};

const getMonthlyTrends = (req, res, next) => {
    try {
        const trends = dashboardService.getMonthlyTrends();
        sendSuccess(res, trends);
    } catch (error) {
        next(error);
    }
};

const getRecentActivity = (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const recent = dashboardService.getRecentActivity(limit);
        sendSuccess(res, recent);
    } catch (error) {
        next(error);
    }
};

export { getSummary, getCategoryBreakdown, getMonthlyTrends, getRecentActivity };