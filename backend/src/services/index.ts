import {
  IUser,
  IStudent,
  IClass,
  IAnnouncement,
  IActivity,
  IAttendanceRecord,
  IMessage,
  AnnouncementType,
  AttendanceStatus,
  MoodType,
} from '../interfaces';
import {
  MOCK_USERS,
  MOCK_STUDENTS,
  MOCK_CLASSES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ACTIVITIES,
  INITIAL_ATTENDANCE,
  INITIAL_MESSAGES,
} from '../models/mockData';

// In-memory store (would be replaced by a DB in production)
let announcements: IAnnouncement[] = [...INITIAL_ANNOUNCEMENTS];
let activities: IActivity[] = [...INITIAL_ACTIVITIES];
let attendance: IAttendanceRecord[] = [...INITIAL_ATTENDANCE];
let messages: IMessage[] = [...INITIAL_MESSAGES];

export class UserService {
  getAll(): IUser[] {
    return MOCK_USERS;
  }

  getById(id: string): IUser | undefined {
    return MOCK_USERS.find((u) => u.id === id);
  }
}

export class StudentService {
  getAll(): IStudent[] {
    return MOCK_STUDENTS;
  }

  getById(id: string): IStudent | undefined {
    return MOCK_STUDENTS.find((s) => s.id === id);
  }

  getByParentId(parentId: string): IStudent | undefined {
    return MOCK_STUDENTS.find((s) => s.parentId === parentId);
  }

  getByClassId(classId: string): IStudent[] {
    return MOCK_STUDENTS.filter((s) => s.classId === classId);
  }
}

export class ClassService {
  getAll(): IClass[] {
    return MOCK_CLASSES;
  }

  getById(id: string): IClass | undefined {
    return MOCK_CLASSES.find((c) => c.id === id);
  }
}

export class AnnouncementService {
  getAll(): IAnnouncement[] {
    return announcements;
  }

  create(text: string, type: AnnouncementType, author: string): IAnnouncement {
    const newAnn: IAnnouncement = {
      id: Date.now(),
      text,
      type,
      date: new Date().toISOString().split('T')[0],
      author,
    };
    announcements = [newAnn, ...announcements];
    return newAnn;
  }
}

export class ActivityService {
  getAll(): IActivity[] {
    return activities;
  }

  getByStudentId(studentId: string): IActivity[] {
    return activities.filter((a) => a.studentId === studentId);
  }

  create(studentId: string, text: string, mood: MoodType): IActivity {
    const newActivity: IActivity = {
      id: Date.now(),
      studentId,
      text,
      date: new Date().toISOString().split('T')[0],
      mood,
    };
    activities = [newActivity, ...activities];
    return newActivity;
  }
}

export class AttendanceService {
  getAll(): IAttendanceRecord[] {
    return attendance;
  }

  getByStudentId(studentId: string): IAttendanceRecord[] {
    return attendance.filter((a) => a.studentId === studentId);
  }

  getByDate(date: string): IAttendanceRecord[] {
    return attendance.filter((a) => a.date === date);
  }

  updateStatus(studentId: string, status: AttendanceStatus, date: string): IAttendanceRecord {
    attendance = attendance.filter((a) => !(a.studentId === studentId && a.date === date));
    const record: IAttendanceRecord = { date, studentId, status };
    attendance = [...attendance, record];
    return record;
  }
}

export class MessageService {
  getAll(): IMessage[] {
    return messages;
  }

  getThread(userId: string, partnerId: string): IMessage[] {
    return messages.filter(
      (m) =>
        (m.fromId === userId && m.toId === partnerId) ||
        (m.fromId === partnerId && m.toId === userId)
    );
  }

  send(fromId: string, toId: string, text: string): IMessage {
    const msg: IMessage = {
      id: Date.now(),
      fromId,
      toId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    messages = [...messages, msg];
    return msg;
  }
}
