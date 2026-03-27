import { Request, Response } from 'express';
import { StudentService } from '../services/StudentService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';

export class StudentController {
  static async getAll(req: Request, res: Response) {
    try {
      const classId = req.query.classId as string | undefined;
      const students = await StudentService.getAll(classId);
      sendSuccess(res, students);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name, dob, classId } = req.body;
      if (!name?.trim() || !dob?.trim() || !classId?.trim()) {
        return sendError(res, 'Name, date of birth, and class are required.', 400);
      }
      const student = await StudentService.create(req.body);
      sendSuccess(res, student, 201);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const authReq = req as unknown as AuthRequest;
      const { name, dob, classId } = req.body;

      if (!name?.trim() || !dob?.trim() || !classId?.trim()) {
        return sendError(res, 'Name, date of birth, and class are required.', 400);
      }

      if (authReq.user.role === 'parent') {
        const isParent = await StudentService.checkParentRelationship(authReq.user.id, studentId);
        if (!isParent) {
          return sendError(res, 'Forbidden: You are not the parent of this student.', 403);
        }
        const student = await StudentService.update(studentId, req.body, true);
        return sendSuccess(res, student);
      }

      const student = await StudentService.update(studentId, req.body);
      sendSuccess(res, student);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async linkParent(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const { parentId } = req.body;
      await StudentService.linkParent(studentId, parentId);
      sendSuccess(res, { studentId, parentId });
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const result = await StudentService.delete(studentId);
      sendSuccess(res, result);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }
}
