import { query } from '../db';
import { IClass } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';

const selectClassesBase = `
  SELECT
    c.id,
    c.name,
    COALESCE(array_remove(array_agg(ct.teacher_id), NULL), ARRAY[]::varchar[]) AS "teacherIds"
  FROM classes c
  LEFT JOIN class_teachers ct ON ct.class_id = c.id
`;

export class ClassService {
  static async getAll() {
    const result = await query(`${selectClassesBase} GROUP BY c.id ORDER BY c.name`);
    return result.rows as IClass[];
  }

  static async getById(id: string) {
    const result = await query(`${selectClassesBase} WHERE c.id = $1 GROUP BY c.id`, [id]);
    return result.rows[0] as IClass | undefined;
  }

  static async create(data: { name: string; teacherIds?: string[] }) {
    const { name, teacherIds = [] } = data;
    const id = uuidv4();

    await query('INSERT INTO classes (id, name) VALUES ($1, $2)', [id, name]);

    for (const teacherId of teacherIds) {
      await query('INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, teacherId]);
    }

    return this.getById(id);
  }

  static async update(id: string, data: { name: string; teacherIds?: string[] }) {
    const { name, teacherIds = [] } = data;

    await query('UPDATE classes SET name = $1 WHERE id = $2', [name, id]);
    await query('DELETE FROM class_teachers WHERE class_id = $1', [id]);

    for (const teacherId of teacherIds) {
      await query('INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, teacherId]);
    }

    return this.getById(id);
  }

  static async delete(id: string) {
    await query('DELETE FROM classes WHERE id = $1', [id]);
    return { deleted: true, id };
  }
}
