import { query } from '../db';
import { IAnnouncement } from '../interfaces';

const selectAnnouncementsBase = `
  SELECT
    a.*,
    c.name as "className"
  FROM announcements a
  LEFT JOIN classes c ON c.id = a."classId"
`;

export class AnnouncementService {
  static async getAll() {
    const result = await query(`${selectAnnouncementsBase} ORDER BY a.id DESC`);
    return result.rows as IAnnouncement[];
  }

  static async create(data: { text: string; type: string; author: string; classId?: string | null }) {
    const { text, type, author, classId = null } = data;
    const date = new Date().toISOString().split('T')[0];
    const result = await query(
      `
        INSERT INTO announcements (text, type, author, date, "classId")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [text, type, author, date, classId]
    );
    const created = await query(`${selectAnnouncementsBase} WHERE a.id = $1`, [result.rows[0].id]);
    return created.rows[0] as IAnnouncement;
  }

  static async update(id: string, data: { text: string; type: string; classId?: string | null }) {
    const { text, type, classId = null } = data;
    await query(
      `UPDATE announcements SET text = $1, type = $2, "classId" = $3 WHERE id = $4 RETURNING *`,
      [text, type, classId, id]
    );
    const updated = await query(`${selectAnnouncementsBase} WHERE a.id = $1`, [id]);
    return updated.rows[0] as IAnnouncement | undefined;
  }

  static async delete(id: string) {
    const result = await query('DELETE FROM announcements WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  }
}
