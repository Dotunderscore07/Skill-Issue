import {
  User,
  Student,
  Announcement,
  Activity,
  AttendanceRecord,
  Message,
} from '../types';

export const MOCK_USERS: User[] = [
  { id: 't1', name: 'Ms. Johnson', role: 'teacher', avatar: '👩‍🏫', classId: 'c1' },
  { id: 'p1', name: 'Mr. Smith', role: 'parent', avatar: '👨‍💼', studentId: 's1' },
  { id: 'p2', name: 'Mrs. Garcia', role: 'parent', avatar: '👩‍⚕️', studentId: 's2' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Alex Smith', classId: 'c1', parentId: 'p1', avatar: '👦' },
  { id: 's2', name: 'Bella Garcia', classId: 'c1', parentId: 'p2', avatar: '👧' },
  { id: 's3', name: 'Charlie Brown', classId: 'c1', parentId: 'p3', avatar: '🧒' },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    text: 'Field trip to the zoo is confirmed for Friday! Please pack a lunch.',
    date: '2023-10-24',
    author: 'Ms. Johnson',
    type: 'urgent',
  },
  {
    id: 2,
    text: 'Parent-Teacher meetings scheduled for next week.',
    date: '2023-10-20',
    author: 'Admin',
    type: 'info',
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  { id: 1, studentId: 's1', text: 'Alex built a huge tower with blocks today!', date: '2023-10-26', mood: 'happy' },
  { id: 2, studentId: 's1', text: 'Nap time was a bit short, but he ate all his apple slices.', date: '2023-10-26', mood: 'neutral' },
  { id: 3, studentId: 's2', text: 'Bella shared her toys very nicely during circle time.', date: '2023-10-26', mood: 'happy' },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { date: '2023-10-26', studentId: 's1', status: 'present' },
  { date: '2023-10-26', studentId: 's2', status: 'late' },
  { date: '2023-10-25', studentId: 's1', status: 'present' },
];

export const INITIAL_MESSAGES: Message[] = [
  { id: 1, fromId: 'p1', toId: 't1', text: 'Hi Ms. Johnson, will Alex need boots for the trip?', timestamp: '10:30 AM', read: true },
  { id: 2, fromId: 't1', toId: 'p1', text: 'Hi Mr. Smith! Yes, it might be muddy.', timestamp: '10:35 AM', read: true },
];
