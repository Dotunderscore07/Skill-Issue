import { query } from '../db';

export class DashboardService {
  static async getCoordinatorSummary() {
    const countsResult = await query(`
      SELECT
        (SELECT COUNT(*) FROM students) as "totalStudents",
        (SELECT COUNT(*) FROM users WHERE role = 'teacher') as "totalTeachers",
        (SELECT COUNT(*) FROM users WHERE role = 'parent') as "totalParents",
        (SELECT COUNT(*) FROM classes) as "totalClasses"
    `);

    const announcementsResult = await query(`
      SELECT a.*, c.name as "className"
      FROM announcements a
      LEFT JOIN classes c ON c.id = a."classId"
      ORDER BY a.date DESC, a.id DESC
      LIMIT 10
    `);

    const summary = countsResult.rows[0];

    return {
      totalTeachers: parseInt(summary.totalTeachers),
      totalChildren: parseInt(summary.totalStudents),
      totalParents: parseInt(summary.totalParents),
      totalClasses: parseInt(summary.totalClasses),
      announcements: announcementsResult.rows
    };
  }
}
