import { Request, Response } from 'express';
import { AttendanceService } from '../services/AttendanceService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';

export class AttendanceController {
  static async getAll(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      const user = authReq.user!;
      const filters: any = {};

      if (user.role === 'parent') {
        filters.parentId = user.id;
      } else if (req.query.studentId) {
        filters.studentId = req.query.studentId;
      } else if (req.query.date) {
        filters.date = req.query.date;
      }

      const records = await AttendanceService.getAll(filters);
      sendSuccess(res, records);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const record = await AttendanceService.update(req.body);
      sendSuccess(res, record);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }
}
