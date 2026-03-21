export type UserRole = 'coordinator' | 'teacher' | 'parent';
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'unmarked';
export type AnnouncementType = 'info' | 'urgent' | 'event';
export type MoodType = 'happy' | 'neutral' | 'sad' | 'energetic';
export type MessageKind = 'direct' | 'broadcast';

export interface IUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar: string;
  classIds?: string[];
}

export interface IStudent {
  id: string;
  name: string;
  dob: string;
  classId: string;
  photo: string;
  parentId?: string;
}

export interface IClass {
  id: string;
  name: string;
  teacherIds?: string[];
}

export interface IAnnouncement {
  id: number;
  text: string;
  date: string;
  author: string;
  type: AnnouncementType;
  classId?: string | null;
  className?: string | null;
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
  toId: string | null;
  text: string;
  image?: string;
  timestamp: string;
  read: boolean;
  kind: MessageKind;
}

export interface IApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
