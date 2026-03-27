"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const AttendanceService_1 = require("../services/AttendanceService");
const apiResponse_1 = require("../utils/apiResponse");
class AttendanceController {
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
            else if (req.query.date) {
                filters.date = req.query.date;
            }
            const records = await AttendanceService_1.AttendanceService.getAll(filters);
            (0, apiResponse_1.sendSuccess)(res, records);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async update(req, res) {
        try {
            await AttendanceService_1.AttendanceService.update(req.body);
            (0, apiResponse_1.sendSuccess)(res, { success: true });
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
}
exports.AttendanceController = AttendanceController;
