import { query } from '../db';
import { IStudent } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';

export class StudentService {
  static async getAll(classId?: string) {
    const params: string[] = [];
    const whereClause = classId ? 'WHERE s."classId" = $1' : '';

    if (classId) {
      params.push(classId);
    }

    const result = await query(
      `
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
      `,
      params
    );
    return result.rows as IStudent[];
  }

  static async getById(id: string) {
    const result = await query(
      `
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
      `,
      [id]
    );
    return result.rows[0] as IStudent | undefined;
  }

  static async create(data: { name: string; dob: string; photo?: string; parentId?: string; classId: string }) {
    const { name, dob, photo = '', parentId, classId } = data;
    const id = uuidv4();

    await query(
      'INSERT INTO students (id, name, dob, photo, "classId") VALUES ($1, $2, $3, $4, $5)',
      [id, name, dob, photo, classId]
    );

    if (parentId) {
      await query('INSERT INTO parent_students (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [parentId, id]);
    }

    return this.getById(id);
  }

  static async update(studentId: string, data: { name: string; dob: string; photo?: string; classId: string; parentId?: string }, isParent = false) {
    const { name, dob, photo = '', classId, parentId } = data;

    if (isParent) {
      // Parent only allowed to update name and photo. dob and classId are kept current.
      await query(
        'UPDATE students SET name = $1, photo = $2 WHERE id = $3',
        [name, photo, studentId]
      );
    } else {
      await query(
        'UPDATE students SET name = $1, dob = $2, photo = $3, "classId" = $4 WHERE id = $5',
        [name, dob, photo, classId, studentId]
      );

      await query('DELETE FROM parent_students WHERE student_id = $1', [studentId]);
      if (parentId) {
        await query('INSERT INTO parent_students (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [parentId, studentId]);
      }
    }

    return this.getById(studentId);
  }

  static async checkParentRelationship(parentId: string, studentId: string) {
    const result = await query(
      'SELECT 1 FROM parent_students WHERE parent_id = $1 AND student_id = $2',
      [parentId, studentId]
    );
    return result.rows.length > 0;
  }

  static async linkParent(studentId: string, parentId?: string) {
    await query('DELETE FROM parent_students WHERE student_id = $1', [studentId]);

    if (parentId) {
      await query(
        'INSERT INTO parent_students (parent_id, student_id) VALUES ($1, $2) RETURNING *',
        [parentId, studentId]
      );
    }
  }

  static async delete(studentId: string) {
    await query('DELETE FROM activities WHERE "studentId" = $1', [studentId]);
    await query('DELETE FROM attendance_records WHERE "studentId" = $1', [studentId]);
    await query('DELETE FROM students WHERE id = $1', [studentId]);
    return { deleted: true, id: studentId };
  }
}
