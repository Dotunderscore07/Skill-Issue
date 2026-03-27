"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityController = void 0;
const ActivityService_1 = require("../services/ActivityService");
const apiResponse_1 = require("../utils/apiResponse");
class ActivityController {
    static async getAll(req, res) {
        try {
            const authReq = req;
            const user = authReq.user;
            const filters = {};
            if (user.role === 'parent') {
                filters.parentId = user.id;
            }
            else if (req.query.studentId) {
                filters.studentId = req.query.studentId;
            }
            const activities = await ActivityService_1.ActivityService.getAll(filters);
            (0, apiResponse_1.sendSuccess)(res, activities);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async create(req, res) {
        try {
            const activity = await ActivityService_1.ActivityService.create(req.body);
            (0, apiResponse_1.sendSuccess)(res, activity, 201);
        }
        catch (err) {
            console.error('Error creating activity:', err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const activity = await ActivityService_1.ActivityService.update(id, req.body);
            if (!activity) {
                return (0, apiResponse_1.sendError)(res, 'Not found', 404);
            }
            (0, apiResponse_1.sendSuccess)(res, activity);
        }
        catch (err) {
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await ActivityService_1.ActivityService.delete(id);
            if (!deleted) {
                return (0, apiResponse_1.sendError)(res, 'Not found', 404);
            }
            (0, apiResponse_1.sendSuccess)(res, { deleted: true });
        }
        catch (err) {
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
}
exports.ActivityController = ActivityController;
