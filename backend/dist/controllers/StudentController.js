"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const StudentService_1 = require("../services/StudentService");
const apiResponse_1 = require("../utils/apiResponse");
class StudentController {
    static async getAll(req, res) {
        try {
            const classId = req.query.classId;
            const students = await StudentService_1.StudentService.getAll(classId);
            (0, apiResponse_1.sendSuccess)(res, students);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async create(req, res) {
        try {
            const { name, dob, classId } = req.body;
            if (!name?.trim() || !dob?.trim() || !classId?.trim()) {
                return (0, apiResponse_1.sendError)(res, 'Name, date of birth, and class are required.', 400);
            }
            const student = await StudentService_1.StudentService.create(req.body);
            (0, apiResponse_1.sendSuccess)(res, student, 201);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async update(req, res) {
        try {
            const { studentId } = req.params;
            const authReq = req;
            const { name, dob, classId } = req.body;
            if (!name?.trim() || !dob?.trim() || !classId?.trim()) {
                return (0, apiResponse_1.sendError)(res, 'Name, date of birth, and class are required.', 400);
            }
            if (authReq.user.role === 'parent') {
                const isParent = await StudentService_1.StudentService.checkParentRelationship(authReq.user.id, studentId);
                if (!isParent) {
                    return (0, apiResponse_1.sendError)(res, 'Forbidden: You are not the parent of this student.', 403);
                }
                const student = await StudentService_1.StudentService.update(studentId, req.body, true);
                return (0, apiResponse_1.sendSuccess)(res, student);
            }
            const student = await StudentService_1.StudentService.update(studentId, req.body);
            (0, apiResponse_1.sendSuccess)(res, student);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async linkParent(req, res) {
        try {
            const { studentId } = req.params;
            const { parentId } = req.body;
            await StudentService_1.StudentService.linkParent(studentId, parentId);
            (0, apiResponse_1.sendSuccess)(res, { studentId, parentId });
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async delete(req, res) {
        try {
            const { studentId } = req.params;
            const result = await StudentService_1.StudentService.delete(studentId);
            (0, apiResponse_1.sendSuccess)(res, result);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
}
exports.StudentController = StudentController;
