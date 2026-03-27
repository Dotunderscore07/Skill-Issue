import { query } from '../db';
import { IMessage } from '../interfaces';
import { decryptField, encryptField } from '../utils/crypto';

const mapMessageRow = (row: any) => ({
  ...row,
  text: decryptField(row.text),
  image: decryptField(row.image),
});

export class MessageService {
  static async getThread(userId: string, filters: { partnerId?: string; kind?: string }) {
    const { partnerId, kind } = filters;


    if (partnerId) {
      const result = await query(
        `
          SELECT *
          FROM messages
          WHERE kind = 'direct'
            AND (("fromId" = $1 AND "toId" = $2) OR ("fromId" = $2 AND "toId" = $1))
          ORDER BY id ASC
        `,
        [userId, partnerId]
      );
      return result.rows.map(mapMessageRow) as IMessage[];
    }

    const result = await query(
      `
        SELECT *
        FROM messages
        WHERE kind = 'direct'
          AND ("fromId" = $1 OR "toId" = $1)
        ORDER BY id ASC
      `,
      [userId]
    );
    return result.rows.map(mapMessageRow) as IMessage[];
  }

  static async send(data: { fromId: string; toId: string; text?: string; image?: string }) {
    const { fromId, toId, text = '', image = '' } = data;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const result = await query(
      `
        INSERT INTO messages ("fromId", "toId", text, image, timestamp, read, kind)
        VALUES ($1, $2, $3, $4, $5, false, 'direct')
        RETURNING *
      `,
      [fromId, toId, encryptField(text), encryptField(image), timestamp]
    );
    return mapMessageRow(result.rows[0]) as IMessage;
  }
}
