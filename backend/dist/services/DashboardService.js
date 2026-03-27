"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const db_1 = require("../db");
class DashboardService {
    static async getCoordinatorSummary() {
        const countsResult = await (0, db_1.query)(`
      SELECT
        (SELECT COUNT(*) FROM students) as "totalStudents",
        (SELECT COUNT(*) FROM users WHERE role = 'teacher') as "totalTeachers",
        (SELECT COUNT(*) FROM classes) as "totalClasses"
    `);
        const teachersResult = await (0, db_1.query)(`
      SELECT u.id, u.name, u.avatar,
             COALESCE(array_remove(array_agg(c.name), NULL), ARRAY[]::varchar[]) as "classes"
      FROM users u
      LEFT JOIN class_teachers ct ON ct.teacher_id = u.id
      LEFT JOIN classes c ON c.id = ct.class_id
      WHERE u.role = 'teacher'
      GROUP BY u.id
      LIMIT 5
    `);
        const studentsResult = await (0, db_1.query)(`
      SELECT s.id, s.name, s.photo, c.name as "className"
      FROM students s
      JOIN classes c ON c.id = s."classId"
      ORDER BY s.id DESC
      LIMIT 10
    `);
        const summary = countsResult.rows[0];
        return {
            stats: {
                totalStudents: parseInt(summary.totalStudents),
                totalTeachers: parseInt(summary.totalTeachers),
                totalClasses: parseInt(summary.totalClasses),
                attendanceRate: 98 // Placeholder for now
            },
            recentTeachers: teachersResult.rows,
            recentStudents: studentsResult.rows
        };
    }
}
exports.DashboardService = DashboardService;
