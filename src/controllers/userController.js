import userService from '../services/userService.js';
import { sendSuccess } from '../utils/response.js';

const getAllUsers = (req, res, next) => {
    try {
        const users = userService.getAllUsers();
        sendSuccess(res, users);
    } catch (error) {
        next(error);
    }
};

const getUserById = (req, res, next) => {
    try {
        const user = userService.getUserById(req.params.id);
        sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
};

const updateUser = (req, res, next) => {
    try {
        const user = userService.updateUser(req.params.id, req.body, req.user);
        sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
};

const updateStatus = (req, res, next) => {
    try {
        const user = userService.updateUserStatus(req.params.id, req.body.status, req.user);
        sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
};

const deleteUser = (req, res, next) => {
    try {
        userService.deleteUser(req.params.id, req.user);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export { getAllUsers, getUserById, updateUser, updateStatus, deleteUser };