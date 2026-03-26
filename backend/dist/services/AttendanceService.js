"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const db_1 = require("../db");
class AttendanceService {
    static async getAll(filters) {
        let queryStr = 'SELECT * FROM attendance_records';
        const queryParams = [];
        if (filters.parentId) {
            queryStr += ' WHERE "studentId" IN (SELECT student_id FROM parent_students WHERE parent_id = $1)';
            queryParams.push(filters.parentId);
        }
        else if (filters.studentId) {
            queryStr += ' WHERE "studentId" = $1';
            queryParams.push(filters.studentId);
        }
        else if (filters.date) {
            queryStr += ' WHERE date = $1';
            queryParams.push(filters.date);
        }
        const result = await (0, db_1.query)(queryStr, queryParams);
        return result.rows;
    }
    static async update(data) {
        const { date, studentId, status } = data;
        await (0, db_1.query)(`
        INSERT INTO attendance_records (date, "studentId", status)
        VALUES ($1, $2, $3)
        ON CONFLICT (date, "studentId") DO UPDATE SET status = EXCLUDED.status
      `, [date, studentId, status]);
    }
}
exports.AttendanceService = AttendanceService;
