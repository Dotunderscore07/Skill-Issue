import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../middlewares/auth';

export class UserController {
  static async getAll(req: Request, res: Response) {
    try {
      const role = req.query.role as string | undefined;
      const users = await UserService.getAll(role);
      sendSuccess(res, users);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserService.getById(id);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      sendSuccess(res, user);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async createTeacher(req: Request, res: Response) {
    try {
      const user = await UserService.createTeacher(req.body);
      sendSuccess(res, user, 201);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as unknown as AuthRequest;

      if (authReq.user.id !== id && authReq.user.role !== 'admin') {
        return sendError(res, 'Access denied', 403);
      }

      const user = await UserService.updateProfile(id, req.body);
      sendSuccess(res, user);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async updateTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserService.updateTeacher(id, req.body);
      sendSuccess(res, user);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }

  static async deleteTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await UserService.deleteTeacher(id);
      sendSuccess(res, result);
    } catch (err) {
      console.error(err);
      sendError(res, 'Internal server error');
    }
  }
}
