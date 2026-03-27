"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const db_1 = require("../db");
const uuid_1 = require("uuid");
class StudentService {
    static async getAll(classId) {
        const params = [];
        const whereClause = classId ? 'WHERE s."classId" = $1' : '';
        if (classId) {
            params.push(classId);
        }
        const result = await (0, db_1.query)(`
        SELECT
          s.*,
          (
            SELECT parent_id
            FROM parent_students ps
            WHERE ps.student_id = s.id
            LIMIT 1
          ) as "parentId"
        FROM students s
        ${whereClause}
        ORDER BY s.name
      `, params);
        return result.rows;
    }
    static async getById(id) {
        const result = await (0, db_1.query)(`
        SELECT
          s.*,
          (
            SELECT parent_id
            FROM parent_students ps
            WHERE ps.student_id = s.id
            LIMIT 1
          ) as "parentId"
        FROM students s
        WHERE s.id = $1
      `, [id]);
        return result.rows[0];
    }
    static async create(data) {
        const { name, dob, photo = '', parentId, classId } = data;
        const id = (0, uuid_1.v4)();
        await (0, db_1.query)('INSERT INTO students (id, name, dob, photo, "classId") VALUES ($1, $2, $3, $4, $5)', [id, name, dob, photo, classId]);
        if (parentId) {
            await (0, db_1.query)('INSERT INTO parent_students (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [parentId, id]);
        }
        return this.getById(id);
    }
    static async update(studentId, data, isParent = false) {
        const { name, dob, photo = '', classId, parentId } = data;
        if (isParent) {
            // Parent only allowed to update name and photo. dob and classId are kept current.
            await (0, db_1.query)('UPDATE students SET name = $1, photo = $2 WHERE id = $3', [name, photo, studentId]);
        }
        else {
            await (0, db_1.query)('UPDATE students SET name = $1, dob = $2, photo = $3, "classId" = $4 WHERE id = $5', [name, dob, photo, classId, studentId]);
            await (0, db_1.query)('DELETE FROM parent_students WHERE student_id = $1', [studentId]);
            if (parentId) {
                await (0, db_1.query)('INSERT INTO parent_students (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [parentId, studentId]);
            }
        }
        return this.getById(studentId);
    }
    static async checkParentRelationship(parentId, studentId) {
        const result = await (0, db_1.query)('SELECT 1 FROM parent_students WHERE parent_id = $1 AND student_id = $2', [parentId, studentId]);
        return result.rows.length > 0;
    }
    static async linkParent(studentId, parentId) {
        await (0, db_1.query)('DELETE FROM parent_students WHERE student_id = $1', [studentId]);
        if (parentId) {
            await (0, db_1.query)('INSERT INTO parent_students (parent_id, student_id) VALUES ($1, $2) RETURNING *', [parentId, studentId]);
        }
    }
    static async delete(studentId) {
        await (0, db_1.query)('DELETE FROM activities WHERE "studentId" = $1', [studentId]);
        await (0, db_1.query)('DELETE FROM attendance_records WHERE "studentId" = $1', [studentId]);
        await (0, db_1.query)('DELETE FROM students WHERE id = $1', [studentId]);
        return { deleted: true, id: studentId };
    }
}
exports.StudentService = StudentService;
