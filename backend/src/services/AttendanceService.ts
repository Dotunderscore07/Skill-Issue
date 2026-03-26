import { query } from '../db';
import { IAttendanceRecord } from '../interfaces';

export class AttendanceService {
  static async getAll(filters: { studentId?: string; parentId?: string; date?: string }) {
    let queryStr = 'SELECT * FROM attendance_records';
    const queryParams: any[] = [];

    if (filters.parentId) {
      queryStr += ' WHERE "studentId" IN (SELECT student_id FROM parent_students WHERE parent_id = $1)';
      queryParams.push(filters.parentId);
    } else if (filters.studentId) {
      queryStr += ' WHERE "studentId" = $1';
      queryParams.push(filters.studentId);
    } else if (filters.date) {
      queryStr += ' WHERE date = $1';
      queryParams.push(filters.date);
    }

    const result = await query(queryStr, queryParams);
    return result.rows as IAttendanceRecord[];
  }

  static async update(data: { date: string; studentId: string; status: string }) {
    const { date, studentId, status } = data;
    const result = await query(
      `
        INSERT INTO attendance_records (date, "studentId", status)
        VALUES ($1, $2, $3)
        ON CONFLICT (date, "studentId") DO UPDATE SET status = EXCLUDED.status
        RETURNING *
      `,
      [date, studentId, status]
    );
    return result.rows[0] as IAttendanceRecord;
  }
}
