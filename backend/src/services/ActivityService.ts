import { query } from '../db';
import { IActivity } from '../interfaces';

export class ActivityService {
  static async getAll(filters: { studentId?: string; parentId?: string }) {
    let queryStr = 'SELECT * FROM activities';
    const queryParams: any[] = [];

    if (filters.parentId) {
      queryStr += ' WHERE "studentId" IN (SELECT student_id FROM parent_students WHERE parent_id = $1)';
      queryParams.push(filters.parentId);
    } else if (filters.studentId) {
      queryStr += ' WHERE "studentId" = $1';
      queryParams.push(filters.studentId);
    }

    queryStr += ' ORDER BY id DESC';

    const result = await query(queryStr, queryParams);
    return result.rows as IActivity[];
  }

  static async create(data: { studentId: string; text: string; mood: string }) {
    const { studentId, text, mood } = data;
    const date = new Date().toISOString().split('T')[0];
    const result = await query(
      'INSERT INTO activities ("studentId", text, date, mood) VALUES ($1, $2, $3, $4) RETURNING *',
      [studentId, text, date, mood]
    );
    return result.rows[0] as IActivity;
  }

  static async update(id: string, data: { text: string; mood: string }) {
    const { text, mood } = data;
    const result = await query(
      'UPDATE activities SET text = $1, mood = $2 WHERE id = $3 RETURNING *',
      [text, mood, id]
    );
    return result.rows[0] as IActivity | undefined;
  }

  static async delete(id: string) {
    const result = await query('DELETE FROM activities WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  }
}
