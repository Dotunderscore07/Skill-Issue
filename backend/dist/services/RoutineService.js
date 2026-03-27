"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutineService = void 0;
const db_1 = require("../db");
const selectRoutinesBase = `
  SELECT
    r.id,
    r."classId",
    c.name as "className",
    r."teacherId",
    u.name as "teacherName",
    r."dayOfWeek",
    r."startTime",
    r."endTime",
    r.title
  FROM routines r
  INNER JOIN classes c ON c.id = r."classId"
  INNER JOIN users u ON u.id = r."teacherId"
`;
const DAY_ORDER = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
class RoutineService {
    static async getAll() {
        const result = await (0, db_1.query)(`${selectRoutinesBase} ORDER BY r.id ASC`);
        return result.rows;
    }
    static async getById(id) {
        const result = await (0, db_1.query)(`${selectRoutinesBase} WHERE r.id = $1`, [id]);
        return result.rows[0];
    }
    static async create(data) {
        const { classId, teacherId, dayOfWeek, startTime, endTime, title } = data;
        const result = await (0, db_1.query)(`
        INSERT INTO routines ("classId", "teacherId", "dayOfWeek", "startTime", "endTime", title)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [classId, teacherId, dayOfWeek, startTime, endTime, title]);
        return this.getById(result.rows[0].id);
    }
    static async update(id, data) {
        const { classId, teacherId, dayOfWeek, startTime, endTime, title } = data;
        await (0, db_1.query)(`
        UPDATE routines
        SET "classId" = $1, "teacherId" = $2, "dayOfWeek" = $3, "startTime" = $4, "endTime" = $5, title = $6
        WHERE id = $7
      `, [classId, teacherId, dayOfWeek, startTime, endTime, title, id]);
        return this.getById(id);
    }
    static async delete(id) {
        const result = await (0, db_1.query)('DELETE FROM routines WHERE id = $1 RETURNING id', [id]);
        return result.rows.length > 0;
    }
    static async validateRoutinePayload(data) {
        const { classId, teacherId, dayOfWeek, startTime, endTime, title, routineId } = data;
        if (!DAY_ORDER.includes(dayOfWeek)) {
            return 'Invalid day selected.';
        }
        if (!title.trim()) {
            return 'Routine title is required.';
        }
        const isValidTime = (value) => /^\d{2}:\d{2}$/.test(value);
        if (!isValidTime(startTime) || !isValidTime(endTime)) {
            return 'Start time and end time must be in HH:MM format.';
        }
        if (startTime >= endTime) {
            return 'End time must be later than start time.';
        }
        const teacherAssignment = await (0, db_1.query)(`
        SELECT 1
        FROM class_teachers
        WHERE class_id = $1 AND teacher_id = $2
        LIMIT 1
      `, [classId, teacherId]);
        if (teacherAssignment.rows.length === 0) {
            return 'Only teachers assigned to this class can be added to its routine.';
        }
        const overlapParams = [classId, dayOfWeek, startTime, endTime];
        let overlapWhere = '';
        if (routineId) {
            overlapParams.push(routineId);
            overlapWhere = `AND r.id <> $5`;
        }
        const overlapping = await (0, db_1.query)(`
        SELECT r.id
        FROM routines r
        WHERE r."classId" = $1
          AND r."dayOfWeek" = $2
          AND r."startTime" < $4
          AND r."endTime" > $3
          ${overlapWhere}
        LIMIT 1
      `, overlapParams);
        if (overlapping.rows.length > 0) {
            return 'This class already has a routine during the selected time.';
        }
        return null;
    }
}
exports.RoutineService = RoutineService;
