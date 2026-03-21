export type UserRole = 'teacher' | 'parent';
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'unmarked';
export type AnnouncementType = 'info' | 'urgent' | 'event';
export type MoodType = 'happy' | 'neutral' | 'sad' | 'energetic';

export interface IUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar: string;
  classId?: string;
}

export interface IStudent {
  id: string;
  name: string;
  classId: string;
  avatar: string;
  parentId?: string;
}

export interface IClass {
  id: string;
  name: string;
}

export interface IAnnouncement {
  id: number;
  text: string;
  date: string;
  author: string;
  type: AnnouncementType;
}

export interface IActivity {
  id: number;
  studentId: string;
  text: string;
  date: string;
  mood: MoodType;
}

export interface IAttendanceRecord {
  date: string;
  studentId: string;
  status: AttendanceStatus;
}

export interface IMessage {
  id: number;
  fromId: string;
  toId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface IApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
