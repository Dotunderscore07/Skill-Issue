"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassController = void 0;
const ClassService_1 = require("../services/ClassService");
const apiResponse_1 = require("../utils/apiResponse");
class ClassController {
    static async getAll(req, res) {
        try {
            const classes = await ClassService_1.ClassService.getAll();
            (0, apiResponse_1.sendSuccess)(res, classes);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async create(req, res) {
        try {
            const cls = await ClassService_1.ClassService.create(req.body);
            (0, apiResponse_1.sendSuccess)(res, cls, 201);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const cls = await ClassService_1.ClassService.update(id, req.body);
            (0, apiResponse_1.sendSuccess)(res, cls);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await ClassService_1.ClassService.delete(id);
            (0, apiResponse_1.sendSuccess)(res, result);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
}
exports.ClassController = ClassController;
