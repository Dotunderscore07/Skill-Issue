import { NextApiRequest, NextApiResponse } from 'next';
import {
  UserService,
  StudentService,
  AnnouncementService,
  ActivityService,
  AttendanceService,
  MessageService,
} from '../services';
import { IApiResponse } from '../interfaces';

const userService = new UserService();
const studentService = new StudentService();
const announcementService = new AnnouncementService();
const activityService = new ActivityService();
const attendanceService = new AttendanceService();
const messageService = new MessageService();

function respond<T>(res: NextApiResponse<IApiResponse<T>>, data: T, status = 200) {
  res.status(status).json({ success: true, data });
}

function respondError(res: NextApiResponse, message: string, status = 400) {
  res.status(status).json({ success: false, data: null, error: message });
}

export class UserController {
  static getAll(req: NextApiRequest, res: NextApiResponse) {
    respond(res, userService.getAll());
  }

  static getById(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const user = userService.getById(id as string);
    if (!user) return respondError(res, 'User not found', 404);
    respond(res, user);
  }
}

export class StudentController {
  static getAll(req: NextApiRequest, res: NextApiResponse) {
    respond(res, studentService.getAll());
  }
}

export class AnnouncementController {
  static getAll(req: NextApiRequest, res: NextApiResponse) {
    respond(res, announcementService.getAll());
  }

  static create(req: NextApiRequest, res: NextApiResponse) {
    const { text, type, author } = req.body as { text: string; type: string; author: string };
    if (!text || !type || !author) return respondError(res, 'Missing fields');
    const ann = announcementService.create(text, type as 'info' | 'urgent' | 'event', author);
    respond(res, ann, 201);
  }
}

export class ActivityController {
  static getAll(req: NextApiRequest, res: NextApiResponse) {
    const { studentId } = req.query;
    const data = studentId
      ? activityService.getByStudentId(studentId as string)
      : activityService.getAll();
    respond(res, data);
  }

  static create(req: NextApiRequest, res: NextApiResponse) {
    const { studentId, text, mood } = req.body as {
      studentId: string;
      text: string;
      mood: string;
    };
    if (!studentId || !text || !mood) return respondError(res, 'Missing fields');
    const act = activityService.create(studentId, text, mood as 'happy' | 'neutral' | 'sad' | 'energetic');
    respond(res, act, 201);
  }
}

export class AttendanceController {
  static getAll(req: NextApiRequest, res: NextApiResponse) {
    const { studentId, date } = req.query;
    if (studentId) return respond(res, attendanceService.getByStudentId(studentId as string));
    if (date) return respond(res, attendanceService.getByDate(date as string));
    respond(res, attendanceService.getAll());
  }

  static update(req: NextApiRequest, res: NextApiResponse) {
    const { studentId, status, date } = req.body as {
      studentId: string;
      status: string;
      date: string;
    };
    if (!studentId || !status || !date) return respondError(res, 'Missing fields');
    const record = attendanceService.updateStatus(
      studentId,
      status as 'present' | 'late' | 'absent',
      date
    );
    respond(res, record);
  }
}

export class MessageController {
  static getThread(req: NextApiRequest, res: NextApiResponse) {
    const { userId, partnerId } = req.query;
    if (!userId || !partnerId) return respondError(res, 'Missing userId or partnerId');
    respond(res, messageService.getThread(userId as string, partnerId as string));
  }

  static send(req: NextApiRequest, res: NextApiResponse) {
    const { fromId, toId, text } = req.body as { fromId: string; toId: string; text: string };
    if (!fromId || !toId || !text) return respondError(res, 'Missing fields');
    const msg = messageService.send(fromId, toId, text);
    respond(res, msg, 201);
  }
}
