"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const db_1 = require("../db");
const crypto_1 = require("../utils/crypto");
const mapMessageRow = (row) => ({
    ...row,
    text: (0, crypto_1.decryptField)(row.text),
    image: (0, crypto_1.decryptField)(row.image),
});
class MessageService {
    static async getThread(userId, filters) {
        const { partnerId, kind } = filters;
        if (kind === 'broadcast') {
            const result = await (0, db_1.query)(`
          SELECT m.*, u.name as "fromName"
          FROM messages m
          LEFT JOIN users u ON u.id = m."fromId"
          WHERE m.kind = 'broadcast'
          ORDER BY m.id DESC
        `);
            return result.rows.map(mapMessageRow);
        }
        if (partnerId) {
            const result = await (0, db_1.query)(`
          SELECT *
          FROM messages
          WHERE kind = 'direct'
            AND (("fromId" = $1 AND "toId" = $2) OR ("fromId" = $2 AND "toId" = $1))
          ORDER BY id ASC
        `, [userId, partnerId]);
            return result.rows.map(mapMessageRow);
        }
        const result = await (0, db_1.query)(`
        SELECT *
        FROM messages
        WHERE kind = 'direct'
          AND ("fromId" = $1 OR "toId" = $1)
        ORDER BY id ASC
      `, [userId]);
        return result.rows.map(mapMessageRow);
    }
    static async send(data) {
        const { fromId, toId, text = '', image = '', kind = 'direct' } = data;
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const result = await (0, db_1.query)(`
        INSERT INTO messages ("fromId", "toId", text, image, timestamp, read, kind)
        VALUES ($1, $2, $3, $4, $5, false, $6)
        RETURNING *
      `, [fromId, kind === 'broadcast' ? null : toId ?? null, (0, crypto_1.encryptField)(text), (0, crypto_1.encryptField)(image), timestamp, kind]);
        return mapMessageRow(result.rows[0]);
    }
}
exports.MessageService = MessageService;
