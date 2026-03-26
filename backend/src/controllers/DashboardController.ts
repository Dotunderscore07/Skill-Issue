import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class DashboardController {
  static async getCoordinatorSummary(req: Request, res: Response) {
    try {
      const summary = await DashboardService.getCoordinatorSummary();
      sendSuccess(res, summary);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }
}
