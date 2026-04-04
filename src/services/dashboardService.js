import Record from '../models/Record.js';

const dashboardService = {
    getSummary() {
        return Record.getSummary();
    },

    getCategoryBreakdown() {
        return Record.getCategoryBreakdown();
    },

    getMonthlyTrends() {
        return Record.getMonthlyTrends();
    },

    getRecentActivity(limit = 10) {
        return Record.getRecent(limit);
    }
};

export default dashboardService;