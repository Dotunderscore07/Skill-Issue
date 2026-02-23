export type UserRole = 'teacher' | 'parent';
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'unmarked';
export type AnnouncementType = 'info' | 'urgent' | 'event';
export type MoodType = 'happy' | 'neutral' | 'sad' | 'energetic';
export type ViewType = 'dashboard' | 'messages' | 'attendance' | 'announcements' | 'activities';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  classId?: string;
  studentId?: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  parentId: string;
  avatar: string;
}

export interface Announcement {
  id: number;
  text: string;
  date: string;
  author: string;
  type: AnnouncementType;
}

export interface Activity {
  id: number;
  studentId: string;
  text: string;
  date: string;
  mood: MoodType;
}

export interface AttendanceRecord {
  date: string;
  studentId: string;
  status: AttendanceStatus;
}

export interface Message {
  id: number;
  fromId: string;
  toId: string;
  text: string;
  timestamp: string;
  read: boolean;
}
