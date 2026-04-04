import recordService from '../services/recordService.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';

const create = (req, res, next) => {
    try {
        const record = recordService.createRecord(req.body, req.user);
        sendCreated(res, record);
    } catch (error) {
        next(error);
    }
};

const getAll = (req, res, next) => {
    try {
        const { data, pagination } = recordService.getRecords(req.query);
        sendPaginated(res, data, pagination);
    } catch (error) {
        next(error);
    }
};

const getById = (req, res, next) => {
    try {
        const record = recordService.getRecordById(req.params.id);
        sendSuccess(res, record);
    } catch (error) {
        next(error);
    }
};

const update = (req, res, next) => {
    try {
        const record = recordService.updateRecord(req.params.id, req.body, req.user);
        sendSuccess(res, record);
    } catch (error) {
        next(error);
    }
};

const remove = (req, res, next) => {
    try {
        recordService.deleteRecord(req.params.id, req.user);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const exportRecords = (req, res, next) => {
    try {
        const { data } = recordService.getRecords(req.query);
        const header = 'Date,Type,Category,Amount,Description\n';
        const rows = data.map(r =>
            `${r.date},${r.type},${r.category},${r.amount},"${r.description || ''}"`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=financial_records.csv');
        res.send(header + rows);
    } catch (error) {
        next(error);
    }
};

export { create, getAll, getById, update, remove, exportRecords };