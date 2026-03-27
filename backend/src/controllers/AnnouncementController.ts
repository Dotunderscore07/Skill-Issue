import { Response } from 'express';
import { AnnouncementService } from '../services/AnnouncementService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';

export class AnnouncementController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const announcements = await AnnouncementService.getAll();
      sendSuccess(res, announcements);
    } catch (err) {
      sendError(res, 'Internal server error');
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const announcement = await AnnouncementService.create(req.body);
      sendSuccess(res, announcement, 201);
    } catch (err) {
      sendError(res, 'Internal server error');
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const announcement = await AnnouncementService.update(id, req.body);
      if (!announcement) {
        return sendError(res, 'Announcement not found', 404);
      }
      sendSuccess(res, announcement);
    } catch (err) {
      sendError(res, 'Internal server error');
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await AnnouncementService.delete(id);
      if (!deleted) {
        return sendError(res, 'Announcement not found', 404);
      }
      sendSuccess(res, { deleted: true, id: Number(id) });
    } catch (err) {
      sendError(res, 'Internal server error');
    }
  }
}
