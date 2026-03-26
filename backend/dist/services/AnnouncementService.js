"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementService = void 0;
const db_1 = require("../db");
const selectAnnouncementsBase = `
  SELECT
    a.*,
    c.name as "className"
  FROM announcements a
  LEFT JOIN classes c ON c.id = a."classId"
`;
class AnnouncementService {
    static async getAll() {
        const result = await (0, db_1.query)(`${selectAnnouncementsBase} ORDER BY a.id DESC`);
        return result.rows;
    }
    static async create(data) {
        const { text, type, author, classId = null } = data;
        const date = new Date().toISOString().split('T')[0];
        const result = await (0, db_1.query)(`
        INSERT INTO announcements (text, type, author, date, "classId")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [text, type, author, date, classId]);
        const created = await (0, db_1.query)(`${selectAnnouncementsBase} WHERE a.id = $1`, [result.rows[0].id]);
        return created.rows[0];
    }
    static async update(id, data) {
        const { text, type, classId = null } = data;
        await (0, db_1.query)(`UPDATE announcements SET text = $1, type = $2, "classId" = $3 WHERE id = $4 RETURNING *`, [text, type, classId, id]);
        const updated = await (0, db_1.query)(`${selectAnnouncementsBase} WHERE a.id = $1`, [id]);
        return updated.rows[0];
    }
    static async delete(id) {
        const result = await (0, db_1.query)('DELETE FROM announcements WHERE id = $1 RETURNING *', [id]);
        return result.rows.length > 0;
    }
}
exports.AnnouncementService = AnnouncementService;
