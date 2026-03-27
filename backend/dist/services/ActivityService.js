"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
const db_1 = require("../db");
class ActivityService {
    static async getAll(filters) {
        let queryStr = 'SELECT * FROM activities';
        const queryParams = [];
        if (filters.parentId) {
            queryStr += ' WHERE "studentId" IN (SELECT student_id FROM parent_students WHERE parent_id = $1)';
            queryParams.push(filters.parentId);
        }
        else if (filters.studentId) {
            queryStr += ' WHERE "studentId" = $1';
            queryParams.push(filters.studentId);
        }
        queryStr += ' ORDER BY id DESC';
        const result = await (0, db_1.query)(queryStr, queryParams);
        return result.rows;
    }
    static async create(data) {
        const { studentId, text, mood } = data;
        const date = new Date().toISOString().split('T')[0];
        const result = await (0, db_1.query)('INSERT INTO activities ("studentId", text, date, mood) VALUES ($1, $2, $3, $4) RETURNING *', [studentId, text, date, mood]);
        return result.rows[0];
    }
    static async update(id, data) {
        const { text, mood } = data;
        const result = await (0, db_1.query)('UPDATE activities SET text = $1, mood = $2 WHERE id = $3 RETURNING *', [text, mood, id]);
        return result.rows[0];
    }
    static async delete(id) {
        const result = await (0, db_1.query)('DELETE FROM activities WHERE id = $1 RETURNING *', [id]);
        return result.rows.length > 0;
    }
}
exports.ActivityService = ActivityService;
