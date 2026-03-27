import { Response } from 'express';
import { MessageService } from '../services/MessageService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';

export class MessageController {
  static async getThread(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.query.partnerId as string | undefined;
      const kind = req.query.kind as string | undefined;
      const messages = await MessageService.getThread(req.user!.id, { partnerId, kind });
      sendSuccess(res, messages);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async send(req: AuthRequest, res: Response) {
    try {
      const message = await MessageService.send({ ...req.body, fromId: req.user!.id });
      sendSuccess(res, message, 201);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }
}
