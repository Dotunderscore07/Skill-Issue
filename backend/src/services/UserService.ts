import { query } from '../db';
import { IUser, UserRole } from '../interfaces';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const selectUsersBase = `
  SELECT
    u.id,
    u.name,
    u.phone,
    u.role,
    u.avatar,
    COALESCE(array_remove(array_agg(ct.class_id), NULL), ARRAY[]::varchar[]) AS "classIds"
  FROM users u
  LEFT JOIN class_teachers ct ON ct.teacher_id = u.id
`;

export class UserService {
  static async getAll(role?: string) {
    const params: string[] = [];
    const whereClause = role ? ' WHERE u.role = $1' : '';

    if (role) {
      params.push(role);
    }

    const result = await query(
      `${selectUsersBase}
       ${whereClause}
       GROUP BY u.id, u.name, u.phone, u.role, u.avatar
       ORDER BY u.name`,
      params
    );

    return result.rows as IUser[];
  }

  static async getById(id: string) {
    const result = await query(
      `${selectUsersBase}
       WHERE u.id = $1
       GROUP BY u.id, u.name, u.phone, u.role, u.avatar`,
      [id]
    );

    return result.rows[0] as IUser | undefined;
  }

  static async createTeacher(data: { name: string; phone: string; password: string; classIds?: string[]; avatar?: string }) {
    const { name, phone, password, classIds = [], avatar: avatarInput } = data;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = uuidv4();
    const avatar = avatarInput || this.buildAvatar(name);

    await query(
      'INSERT INTO users (id, name, phone, role, password, avatar) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, name, phone, 'teacher', hashedPassword, avatar]
    );

    for (const classId of classIds) {
      await query('INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [classId, id]);
    }

    return this.getById(id);
  }

  static async updateProfile(id: string, data: { name: string; phone: string; avatar?: string; password?: string }) {
    const { name, phone, avatar: avatarInput, password } = data;
    const avatar = avatarInput || this.buildAvatar(name);

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await query(
        'UPDATE users SET name = $1, phone = $2, avatar = $3, password = $4 WHERE id = $5',
        [name, phone, avatar, hashedPassword, id]
      );
    } else {
      await query(
        'UPDATE users SET name = $1, phone = $2, avatar = $3 WHERE id = $4',
        [name, phone, avatar, id]
      );
    }

    return this.getById(id);
  }

  static async updateTeacher(id: string, data: { name: string; phone: string; password?: string; classIds?: string[]; avatar?: string }) {
    const { name, phone, password, classIds = [], avatar: avatarInput } = data;
    const avatar = avatarInput || this.buildAvatar(name);

    await query('UPDATE users SET name = $1, phone = $2, avatar = $3 WHERE id = $4 AND role = $5', [
      name,
      phone,
      avatar,
      id,
      'teacher',
    ]);

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
    }

    await query('DELETE FROM class_teachers WHERE teacher_id = $1', [id]);
    for (const classId of classIds) {
      await query('INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [classId, id]);
    }

    return this.getById(id);
  }

  static async deleteTeacher(id: string) {
    await query('DELETE FROM messages WHERE "fromId" = $1 OR "toId" = $1', [id]);
    await query('DELETE FROM users WHERE id = $1', [id]);
    return { deleted: true, id };
  }

  private static buildAvatar(name: string) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
}
