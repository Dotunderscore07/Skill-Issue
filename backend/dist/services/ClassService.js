"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassService = void 0;
const db_1 = require("../db");
const uuid_1 = require("uuid");
const selectClassesBase = `
  SELECT
    c.id,
    c.name,
    COALESCE(array_remove(array_agg(ct.teacher_id), NULL), ARRAY[]::varchar[]) AS "teacherIds"
  FROM classes c
  LEFT JOIN class_teachers ct ON ct.class_id = c.id
`;
class ClassService {
    static async getAll() {
        const result = await (0, db_1.query)(`${selectClassesBase} GROUP BY c.id ORDER BY c.name`);
        return result.rows;
    }
    static async getById(id) {
        const result = await (0, db_1.query)(`${selectClassesBase} WHERE c.id = $1 GROUP BY c.id`, [id]);
        return result.rows[0];
    }
    static async create(data) {
        const { name, teacherIds = [] } = data;
        const id = (0, uuid_1.v4)();
        await (0, db_1.query)('INSERT INTO classes (id, name) VALUES ($1, $2)', [id, name]);
        for (const teacherId of teacherIds) {
            await (0, db_1.query)('INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, teacherId]);
        }
        return this.getById(id);
    }
    static async update(id, data) {
        const { name, teacherIds = [] } = data;
        await (0, db_1.query)('UPDATE classes SET name = $1 WHERE id = $2', [name, id]);
        await (0, db_1.query)('DELETE FROM class_teachers WHERE class_id = $1', [id]);
        for (const teacherId of teacherIds) {
            await (0, db_1.query)('INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, teacherId]);
        }
        return this.getById(id);
    }
    static async delete(id) {
        await (0, db_1.query)('DELETE FROM classes WHERE id = $1', [id]);
        return { deleted: true, id };
    }
}
exports.ClassService = ClassService;
