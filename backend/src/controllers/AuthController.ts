import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { v4 as uuidv4 } from 'uuid';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, phone, password } = req.body;
      
      if (!name || !phone || !password) {
        res.status(400).json({ success: false, data: null, error: 'Missing required fields' });
        return;
      }

      const existingUser = await query('SELECT * FROM users WHERE phone = $1', [phone]);
      if (existingUser.rows.length > 0) {
        res.status(409).json({ success: false, data: null, error: 'Phone number already registered' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const id = uuidv4();
      const role = 'parent';

      await query(
        'INSERT INTO users (id, name, phone, role, password) VALUES ($1, $2, $3, $4, $5)',
        [id, name, phone, role, hashedPassword]
      );

      const payload = { user: { id, role } };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 });

      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // Set true in production with HTTPS
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.status(201).json({ success: true, data: { id, name, phone, role }, error: null });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        res.status(400).json({ success: false, data: null, error: 'Missing phone or password' });
        return;
      }

      const result = await query('SELECT * FROM users WHERE phone = $1', [phone]);
      const user = result.rows[0];

      if (!user) {
        res.status(401).json({ success: false, data: null, error: 'Invalid phone or password' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ success: false, data: null, error: 'Invalid ID or password' });
        return;
      }

      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 });

      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // Set true in production with HTTPS
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json({ success: true, data: { user: { id: user.id, name: user.name, phone: user.phone, role: user.role } }, error: null });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  public static async me(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as any;
      const result = await query('SELECT id, name, phone, role FROM users WHERE id = $1', [authReq.user.id]);
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, data: null, error: 'User not found' });
        return;
      }
      res.json({ success: true, data: result.rows[0], error: null });
    } catch (e) {
      res.status(500).json({ success: false, data: null, error: 'Internal server error' });
    }
  }

  public static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('token');
    res.json({ success: true, data: null, error: null });
  }
}
