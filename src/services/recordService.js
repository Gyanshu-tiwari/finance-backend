import Record from '../models/Record.js';
import auditService from './auditService.js';
import { NotFoundError } from '../utils/errors.js';

const recordService = {
    createRecord(data, user) {
        const record = Record.create({ ...data, createdBy: user.id });
        auditService.log(user.id, 'CREATE', 'financial_record', record.id, data);
        return record;
    },

    getRecords(filters) {
        const { data, total } = Record.findAll(filters);
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 10;
        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords: total,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    },

    getRecordById(id) {
        const record = Record.findById(id);
        if (!record) throw new NotFoundError('Record not found');
        return record;
    },

    updateRecord(id, data, user) {
        const record = Record.findById(id);
        if (!record) throw new NotFoundError('Record not found');

        const updatedRecord = Record.update(id, data);
        auditService.log(user.id, 'UPDATE', 'financial_record', id, data);
        return updatedRecord;
    },

    deleteRecord(id, user) {
        const record = Record.findById(id);
        if (!record) throw new NotFoundError('Record not found');

        Record.softDelete(id);
        auditService.log(user.id, 'DELETE', 'financial_record', id, { amount: record.amount, category: record.category });
    }
};

export default recordService;