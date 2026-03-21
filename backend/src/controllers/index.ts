import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
import { AuthRequest } from '../middlewares/auth';

const buildAvatar = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

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

const selectClassesBase = `
  SELECT
    c.id,
    c.name,
    COALESCE(array_remove(array_agg(ct.teacher_id), NULL), ARRAY[]::varchar[]) AS "teacherIds"
  FROM classes c
  LEFT JOIN class_teachers ct ON ct.class_id = c.id
`;

export class UserController {
  static async getAll(req: ExpressRequest, res: ExpressResponse) {
    try {
      const role = req.query.role as string | undefined;
      const params: string[] = [];
      const whereClause = role ? ' WHERE u.role = $1' : '';

      if (role) {
        params.push(role);
      }

      const result = await query(
        `${selectUsersBase}
         ${whereClause}
         GROUP BY u.id
         ORDER BY u.name`,
        params
      );

      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async getById(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { id } = req.params;
      const result = await query(
        `${selectUsersBase}
         WHERE u.id = $1
         GROUP BY u.id`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, data: null, error: 'User not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async createTeacher(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { name, phone, password, classIds = [] } = req.body as {
        name: string;
        phone: string;
        password: string;
        classIds?: string[];
      };

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const id = uuidv4();
      const avatar = buildAvatar(name);

      await query(
        'INSERT INTO users (id, name, phone, role, password, avatar) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, name, phone, 'teacher', hashedPassword, avatar]
      );

      for (const classId of classIds) {
        await query('INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [classId, id]);
      }

      const created = await query(
        `${selectUsersBase}
         WHERE u.id = $1
         GROUP BY u.id`,
        [id]
      );

      res.status(201).json({ success: true, data: created.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async updateTeacher(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { id } = req.params;
      const { name, phone, password, classIds = [] } = req.body as {
        name: string;
        phone: string;
        password?: string;
        classIds?: string[];
      };

      await query('UPDATE users SET name = $1, phone = $2, avatar = $3 WHERE id = $4 AND role = $5', [
        name,
        phone,
        buildAvatar(name),
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

      const updated = await query(
        `${selectUsersBase}
         WHERE u.id = $1
         GROUP BY u.id`,
        [id]
      );

      res.json({ success: true, data: updated.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }
}

export class StudentController {
  static async getAll(req: ExpressRequest, res: ExpressResponse) {
    try {
      const classId = req.query.classId as string | undefined;
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
      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async create(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { name, dob, photo = '', parentId, classId } = req.body as {
        name: string;
        dob: string;
        photo?: string;
        parentId?: string;
        classId: string;
      };

      const id = uuidv4();

      await query(
        'INSERT INTO students (id, name, dob, photo, "classId") VALUES ($1, $2, $3, $4, $5)',
        [id, name, dob, photo, classId]
      );

      if (parentId) {
        await query('INSERT INTO parent_students (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [parentId, id]);
      }

      const created = await query(
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

      res.status(201).json({ success: true, data: created.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async update(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { studentId } = req.params;
      const { name, dob, photo = '', parentId, classId } = req.body as {
        name: string;
        dob: string;
        photo?: string;
        parentId?: string;
        classId: string;
      };

      await query(
        'UPDATE students SET name = $1, dob = $2, photo = $3, "classId" = $4 WHERE id = $5',
        [name, dob, photo, classId, studentId]
      );

      await query('DELETE FROM parent_students WHERE student_id = $1', [studentId]);
      if (parentId) {
        await query('INSERT INTO parent_students (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [parentId, studentId]);
      }

      const updated = await query(
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
        [studentId]
      );

      res.json({ success: true, data: updated.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async linkParent(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { studentId } = req.params;
      const { parentId } = req.body;

      await query('DELETE FROM parent_students WHERE student_id = $1', [studentId]);

      if (parentId) {
        await query(
          'INSERT INTO parent_students (parent_id, student_id) VALUES ($1, $2) RETURNING *',
          [parentId, studentId]
        );
      }

      res.json({ success: true, data: { studentId, parentId } });
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

  static async create(req: AuthRequest, res: ExpressResponse) {
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
  static async getThread(req: AuthRequest, res: ExpressResponse) {
    try {
      const partnerId = req.query.partnerId as string | undefined;
      const kind = req.query.kind as string | undefined;

      if (kind === 'broadcast') {
        const result = await query(
          `
            SELECT m.*, u.name as "fromName"
            FROM messages m
            LEFT JOIN users u ON u.id = m."fromId"
            WHERE m.kind = 'broadcast'
            ORDER BY m.id DESC
          `
        );
        return res.json({ success: true, data: result.rows });
      }

      if (partnerId) {
        const result = await query(
          `
            SELECT *
            FROM messages
            WHERE kind = 'direct'
              AND (("fromId" = $1 AND "toId" = $2) OR ("fromId" = $2 AND "toId" = $1))
            ORDER BY id ASC
          `,
          [req.user!.id, partnerId]
        );
        return res.json({ success: true, data: result.rows });
      }

      const result = await query(
        `
          SELECT *
          FROM messages
          WHERE kind = 'direct'
            AND ("fromId" = $1 OR "toId" = $1)
          ORDER BY id ASC
        `,
        [req.user!.id]
      );
      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async send(req: AuthRequest, res: ExpressResponse) {
    try {
      const { toId, text, kind = 'direct' } = req.body as {
        toId?: string | null;
        text: string;
        kind?: 'direct' | 'broadcast';
      };
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (kind === 'broadcast' && req.user?.role !== 'coordinator') {
        return res.status(403).json({ success: false, data: null, error: 'Forbidden' });
      }

      const result = await query(
        'INSERT INTO messages ("fromId", "toId", text, timestamp, read, kind) VALUES ($1, $2, $3, $4, false, $5) RETURNING *',
        [req.user!.id, kind === 'broadcast' ? null : toId ?? null, text, timestamp, kind]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }
}

export class ActivityController {
  static async getAll(req: ExpressRequest, res: ExpressResponse) {
    try {
      const authReq = req as AuthRequest;
      const user = authReq.user!;

      let queryStr = 'SELECT * FROM activities';
      const queryParams: any[] = [];

      if (user.role === 'parent') {
        queryStr += ' WHERE "studentId" IN (SELECT student_id FROM parent_students WHERE parent_id = $1)';
        queryParams.push(user.id);
      } else if (req.query.studentId) {
        queryStr += ' WHERE "studentId" = $1';
        queryParams.push(req.query.studentId);
      }

      queryStr += ' ORDER BY id DESC';

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
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, data: null, error: 'Not found' });
      }
      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async delete(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM activities WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, data: null, error: 'Not found' });
      }
      res.json({ success: true, data: { deleted: true } });
    } catch (err) {
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }
}

export class AttendanceController {
  static async getAll(req: ExpressRequest, res: ExpressResponse) {
    try {
      const authReq = req as AuthRequest;
      const user = authReq.user!;

      let queryStr = 'SELECT * FROM attendance_records';
      const queryParams: any[] = [];

      if (user.role === 'parent') {
        queryStr += ' WHERE "studentId" IN (SELECT student_id FROM parent_students WHERE parent_id = $1)';
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

export class ClassController {
  static async getAll(req: ExpressRequest, res: ExpressResponse) {
    try {
      const result = await query(
        `${selectClassesBase}
         GROUP BY c.id
         ORDER BY c.name`
      );
      res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async create(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { name, teacherIds = [] } = req.body as { name: string; teacherIds?: string[] };
      const id = uuidv4();

      await query('INSERT INTO classes (id, name) VALUES ($1, $2)', [id, name]);
      for (const teacherId of teacherIds) {
        await query('INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, teacherId]);
      }

      const created = await query(
        `${selectClassesBase}
         WHERE c.id = $1
         GROUP BY c.id`,
        [id]
      );
      res.status(201).json({ success: true, data: created.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  static async update(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { id } = req.params;
      const { name, teacherIds = [] } = req.body as { name: string; teacherIds?: string[] };

      await query('UPDATE classes SET name = $1 WHERE id = $2', [name, id]);
      await query('DELETE FROM class_teachers WHERE class_id = $1', [id]);
      for (const teacherId of teacherIds) {
        await query('INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, teacherId]);
      }

      const updated = await query(
        `${selectClassesBase}
         WHERE c.id = $1
         GROUP BY c.id`,
        [id]
      );
      res.json({ success: true, data: updated.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }
}

export class DashboardController {
  static async getCoordinatorSummary(req: ExpressRequest, res: ExpressResponse) {
    try {
      const [teachers, children, parents, announcements] = await Promise.all([
        query("SELECT COUNT(*)::int AS total FROM users WHERE role = 'teacher'"),
        query('SELECT COUNT(*)::int AS total FROM students'),
        query("SELECT COUNT(*)::int AS total FROM users WHERE role = 'parent'"),
        query('SELECT * FROM announcements ORDER BY id DESC LIMIT 5'),
      ]);

      res.json({
        success: true,
        data: {
          totalTeachers: teachers.rows[0].total,
          totalChildren: children.rows[0].total,
          totalParents: parents.rows[0].total,
          announcements: announcements.rows,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }
}
