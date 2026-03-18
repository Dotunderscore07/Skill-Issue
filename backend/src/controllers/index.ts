import { query } from '../db';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

export class UserController {
  static async getAll(req: ExpressRequest, res: ExpressResponse) {
    try {
      const result = await query('SELECT id, name, role, "studentId", "classId" FROM users');
      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async getById(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { id } = req.params;
      const result = await query('SELECT id, name, role, "studentId", "classId" FROM users WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, data: null, error: 'User not found' });
      }
      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }
}

export class StudentController {
  static async getAll(req: ExpressRequest, res: ExpressResponse) {
    try {
      const result = await query('SELECT * FROM students');
      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async linkParent(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { studentId } = req.params;
      const { parentId } = req.body;

      if (!parentId) {
        return res.status(400).json({ success: false, data: null, error: 'parentId is required' });
      }

      const result = await query(
        'UPDATE students SET "parentId" = $1 WHERE id = $2 RETURNING *',
        [parentId, studentId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, data: null, error: 'Student not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }
}

export class AnnouncementController {
  static async getAll(req: ExpressRequest, res: ExpressResponse) {
    try {
      const result = await query('SELECT * FROM announcements ORDER BY id DESC');
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async create(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { text, type, author } = req.body;
      const date = new Date().toISOString().split('T')[0];
      const result = await query(
        'INSERT INTO announcements (text, type, author, date) VALUES ($1, $2, $3, $4) RETURNING *',
        [text, type, author, date]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }
}

export class MessageController {
  static async getThread(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { userId, partnerId } = req.query;
      const result = await query(
        'SELECT * FROM messages WHERE ("fromId" = $1 AND "toId" = $2) OR ("fromId" = $2 AND "toId" = $1)',
        [userId, partnerId]
      );
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async send(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { fromId, toId, text } = req.body;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const result = await query(
        'INSERT INTO messages ("fromId", "toId", text, timestamp, read) VALUES ($1, $2, $3, $4, false) RETURNING *',
        [fromId, toId, text, timestamp]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }
}

export class ActivityController {
  static async getAll(req: ExpressRequest, res: ExpressResponse) {
    try {
      const authReq = req as any; // Type hack for quick access or import AuthRequest
      const user = authReq.user;
      
      let queryStr = 'SELECT * FROM activities';
      let queryParams: any[] = [];

      if (user.role === 'parent') {
        queryStr += ' WHERE "studentId" IN (SELECT id FROM students WHERE "parentId" = $1)';
        queryParams.push(user.id);
      } else if (req.query.studentId) {
        queryStr += ' WHERE "studentId" = $1';
        queryParams.push(req.query.studentId);
      }
      
      const result = await query(queryStr, queryParams);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async create(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { studentId, text, mood } = req.body;
      const date = new Date().toISOString().split('T')[0];
      const result = await query(
        'INSERT INTO activities ("studentId", text, date, mood) VALUES ($1, $2, $3, $4) RETURNING *',
        [studentId, text, date, mood]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error('Error creating activity:', err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async update(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { id } = req.params;
      const { text, mood } = req.body;
      const result = await query(
        'UPDATE activities SET text = $1, mood = $2 WHERE id = $3 RETURNING *',
        [text, mood, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ success: false, data: null, error: 'Not found' });
      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async delete(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM activities WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) return res.status(404).json({ success: false, data: null, error: 'Not found' });
      res.json({ success: true, data: { deleted: true } });
    } catch (err) {
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }
}

export class AttendanceController {
  static async getAll(req: ExpressRequest, res: ExpressResponse) {
    try {
      const authReq = req as any;
      const user = authReq.user;
      
      let queryStr = 'SELECT * FROM attendance_records';
      let queryParams: any[] = [];

      if (user.role === 'parent') {
        queryStr += ' WHERE "studentId" IN (SELECT id FROM students WHERE "parentId" = $1)';
        queryParams.push(user.id);
      } else if (req.query.studentId) {
        queryStr += ' WHERE "studentId" = $1';
        queryParams.push(req.query.studentId);
      } else if (req.query.date) {
        queryStr += ' WHERE date = $1';
        queryParams.push(req.query.date);
      }
      
      const result = await query(queryStr, queryParams);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async update(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { studentId, status, date } = req.body;
      const existing = await query('SELECT * FROM attendance_records WHERE "studentId" = $1 AND date = $2', [studentId, date]);
      
      let result;
      if (existing.rows.length > 0) {
        result = await query('UPDATE attendance_records SET status = $1 WHERE id = $2 RETURNING *', [status, existing.rows[0].id]);
      } else {
        result = await query('INSERT INTO attendance_records ("studentId", status, date) VALUES ($1, $2, $3) RETURNING *', [studentId, status, date]);
      }
      
      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }
}

