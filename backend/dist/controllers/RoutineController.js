"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutineController = void 0;
const RoutineService_1 = require("../services/RoutineService");
const apiResponse_1 = require("../utils/apiResponse");
class RoutineController {
    static async getAll(req, res) {
        try {
            const classId = req.query.classId;
            const teacherId = req.query.teacherId;
            const dayOfWeek = req.query.dayOfWeek;
            let routines = await RoutineService_1.RoutineService.getAll();
            // Filter logic (could be moved to service if complex, but kept here for now for simplicity of filtering mapping)
            if (classId)
                routines = routines.filter(r => r.classId === classId);
            if (teacherId)
                routines = routines.filter(r => r.teacherId === teacherId);
            if (dayOfWeek)
                routines = routines.filter(r => r.dayOfWeek === dayOfWeek);
            if (req.user?.role === 'teacher') {
                const user = req.user;
                // Teachers see routines for classes they are assigned to
                // This check would ideally be in the service filtering but requires class_teachers info
                // Let's assume for now that simple filtering is okay or we could have improved RoutineService.getAll
            }
            (0, apiResponse_1.sendSuccess)(res, routines);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async create(req, res) {
        try {
            const error = await RoutineService_1.RoutineService.validateRoutinePayload(req.body);
            if (error) {
                return (0, apiResponse_1.sendError)(res, error, 400);
            }
            const routine = await RoutineService_1.RoutineService.create(req.body);
            (0, apiResponse_1.sendSuccess)(res, routine, 201);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async update(req, res) {
        try {
            const id = Number(req.params.id);
            const error = await RoutineService_1.RoutineService.validateRoutinePayload({ ...req.body, routineId: id });
            if (error) {
                return (0, apiResponse_1.sendError)(res, error, 400);
            }
            const routine = await RoutineService_1.RoutineService.update(id, req.body);
            (0, apiResponse_1.sendSuccess)(res, routine);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async delete(req, res) {
        try {
            const id = Number(req.params.id);
            const success = await RoutineService_1.RoutineService.delete(id);
            if (!success) {
                return (0, apiResponse_1.sendError)(res, 'Routine not found', 404);
            }
            (0, apiResponse_1.sendSuccess)(res, { deleted: true, id });
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
}
exports.RoutineController = RoutineController;
