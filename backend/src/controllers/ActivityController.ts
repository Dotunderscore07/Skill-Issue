import { Request, Response } from 'express';
import { ActivityService } from '../services/ActivityService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';

export class ActivityController {
  static async getAll(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      const user = authReq.user!;
      const filters: any = {};

      if (user.role === 'parent') {
        filters.parentId = user.id;
      } else if (req.query.studentId) {
        filters.studentId = req.query.studentId;
      }

      const activities = await ActivityService.getAll(filters);
      sendSuccess(res, activities);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const activity = await ActivityService.create(req.body);
      sendSuccess(res, activity, 201);
    } catch (err) {
      console.error('Error creating activity:', err);
      sendError(res, 'Internal server error');
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const activity = await ActivityService.update(id, req.body);
      if (!activity) {
        return sendError(res, 'Not found', 404);
      }
      sendSuccess(res, activity);
    } catch (err) {
      sendError(res, 'Internal server error');
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await ActivityService.delete(id);
      if (!deleted) {
        return sendError(res, 'Not found', 404);
      }
      sendSuccess(res, { deleted: true });
    } catch (err) {
      sendError(res, 'Internal server error');
    }
  }
}
