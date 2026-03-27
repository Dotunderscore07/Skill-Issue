import { Request, Response } from 'express';
import { ClassService } from '../services/ClassService';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class ClassController {
  static async getAll(req: Request, res: Response) {
    try {
      const classes = await ClassService.getAll();
      sendSuccess(res, classes);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const cls = await ClassService.create(req.body);
      sendSuccess(res, cls, 201);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cls = await ClassService.update(id, req.body);
      sendSuccess(res, cls);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ClassService.delete(id);
      sendSuccess(res, result);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }
}
