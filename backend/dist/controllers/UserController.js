"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserService_1 = require("../services/UserService");
const apiResponse_1 = require("../utils/apiResponse");
class UserController {
    static async getAll(req, res) {
        try {
            const role = req.query.role;
            const users = await UserService_1.UserService.getAll(role);
            (0, apiResponse_1.sendSuccess)(res, users);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserService_1.UserService.getById(id);
            if (!user) {
                return (0, apiResponse_1.sendError)(res, 'User not found', 404);
            }
            (0, apiResponse_1.sendSuccess)(res, user);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async createTeacher(req, res) {
        try {
            const user = await UserService_1.UserService.createTeacher(req.body);
            (0, apiResponse_1.sendSuccess)(res, user, 201);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async updateProfile(req, res) {
        try {
            const { id } = req.params;
            const authReq = req;
            if (authReq.user.id !== id && authReq.user.role !== 'admin') {
                return (0, apiResponse_1.sendError)(res, 'Access denied', 403);
            }
            const user = await UserService_1.UserService.updateProfile(id, req.body);
            (0, apiResponse_1.sendSuccess)(res, user);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async updateTeacher(req, res) {
        try {
            const { id } = req.params;
            const user = await UserService_1.UserService.updateTeacher(id, req.body);
            (0, apiResponse_1.sendSuccess)(res, user);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async deleteTeacher(req, res) {
        try {
            const { id } = req.params;
            const result = await UserService_1.UserService.deleteTeacher(id);
            (0, apiResponse_1.sendSuccess)(res, result);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
}
exports.UserController = UserController;
