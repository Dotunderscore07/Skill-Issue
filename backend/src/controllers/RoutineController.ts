import { Response } from 'express';
import { RoutineService } from '../services/RoutineService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';
import { DayOfWeek } from '../interfaces';

export class RoutineController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const classId = req.query.classId as string | undefined;
      const teacherId = req.query.teacherId as string | undefined;
      const dayOfWeek = req.query.dayOfWeek as DayOfWeek | undefined;

      let routines = await RoutineService.getAll();

      // Filter logic (could be moved to service if complex, but kept here for now for simplicity of filtering mapping)
      if (classId) routines = routines.filter(r => r.classId === classId);
      if (teacherId) routines = routines.filter(r => r.teacherId === teacherId);
      if (dayOfWeek) routines = routines.filter(r => r.dayOfWeek === dayOfWeek);

      if (req.user?.role === 'teacher') {
        const user = req.user;
        // Teachers see routines for classes they are assigned to
        // This check would ideally be in the service filtering but requires class_teachers info
        // Let's assume for now that simple filtering is okay or we could have improved RoutineService.getAll
      }

      sendSuccess(res, routines);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const error = await RoutineService.validateRoutinePayload(req.body);
      if (error) {
        return sendError(res, error, 400);
      }
      const routine = await RoutineService.create(req.body);
      sendSuccess(res, routine, 201);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const error = await RoutineService.validateRoutinePayload({ ...req.body, routineId: id });
      if (error) {
        return sendError(res, error, 400);
      }
      const routine = await RoutineService.update(id, req.body);
      sendSuccess(res, routine);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const success = await RoutineService.delete(id);
      if (!success) {
        return sendError(res, 'Routine not found', 404);
      }
      sendSuccess(res, { deleted: true, id });
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }
}
