export type UserRole = 'coordinator' | 'teacher' | 'parent';
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'unmarked';
export type AnnouncementType = 'info' | 'urgent' | 'event';
export type MoodType = 'happy' | 'neutral' | 'sad' | 'energetic';
export type MessageKind = 'direct' | 'broadcast';
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
export type ViewType =
  | 'dashboard'
  | 'messages'
  | 'attendance'
  | 'announcements'
  | 'activities'
  | 'teachers'
  | 'children'
  | 'classes'
  | 'routines';

export interface User {
  id: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar: string;
  classIds?: string[];
}

export interface Class {
  id: string;
  name: string;
  teacherIds?: string[];
}

export interface Student {
  id: string;
  name: string;
  dob: string;
  classId: string;
  parentId?: string;
  photo: string;
}

export interface Announcement {
  id: number;
  text: string;
  date: string;
  author: string;
  type: AnnouncementType;
  classId?: string | null;
  className?: string | null;
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
  toId: string | null;
  text: string;
  image?: string;
  timestamp: string;
  read: boolean;
  kind: MessageKind;
}

export interface Routine {
  id: number;
  classId: string;
  className?: string;
  teacherId: string;
  teacherName?: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  title: string;
}
