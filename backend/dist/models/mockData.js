"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_ROUTINES = exports.INITIAL_MESSAGES = exports.INITIAL_ATTENDANCE = exports.INITIAL_ACTIVITIES = exports.INITIAL_ANNOUNCEMENTS = exports.MOCK_CLASSES = exports.MOCK_STUDENTS = exports.MOCK_USERS = void 0;
exports.MOCK_USERS = [
    { id: 'co1', name: 'Coordinator Mia', phone: '9', role: 'coordinator', avatar: 'CM' },
    { id: 't1', name: 'Ms. Johnson', phone: '1', role: 'teacher', avatar: 'MJ', classIds: ['c1'] },
    { id: 'p1', name: 'Mr. Smith', phone: '2', role: 'parent', avatar: 'MS' },
    { id: 'p2', name: 'Mrs. Garcia', phone: '3', role: 'parent', avatar: 'MG' },
];
exports.MOCK_STUDENTS = [
    { id: 's1', name: 'Alex Smith', dob: '2019-03-14', classId: 'c1', photo: '', parentId: 'p1' },
    { id: 's2', name: 'Bella Garcia', dob: '2019-07-02', classId: 'c1', photo: '', parentId: 'p2' },
    { id: 's3', name: 'Charlie Brown', dob: '2020-01-19', classId: 'c1', photo: '', parentId: 'p1' },
];
exports.MOCK_CLASSES = [
    { id: 'c1', name: 'Sunshine Kindergarten (K1)' },
];
exports.INITIAL_ANNOUNCEMENTS = [
    {
        id: 1,
        text: 'Field trip to the zoo is confirmed for Friday! Please pack a lunch.',
        date: '2023-10-24',
        author: 'Ms. Johnson',
        type: 'urgent',
        classId: 'c1',
        className: 'Sunshine Kindergarten (K1)',
    },
    {
        id: 2,
        text: 'Parent-Teacher meetings scheduled for next week.',
        date: '2023-10-20',
        author: 'Coordinator Mia',
        type: 'info',
        classId: null,
        className: null,
    },
];
exports.INITIAL_ACTIVITIES = [
    {
        id: 1,
        studentId: 's1',
        text: 'Alex built a huge tower with blocks today!',
        date: '2023-10-26',
        mood: 'happy',
    },
    {
        id: 2,
        studentId: 's1',
        text: 'Nap time was a bit short, but he ate all his apple slices.',
        date: '2023-10-26',
        mood: 'neutral',
    },
    {
        id: 3,
        studentId: 's2',
        text: 'Bella shared her toys very nicely during circle time.',
        date: '2023-10-26',
        mood: 'happy',
    },
];
exports.INITIAL_ATTENDANCE = [
    { date: '2023-10-26', studentId: 's1', status: 'present' },
    { date: '2023-10-26', studentId: 's2', status: 'late' },
    { date: '2023-10-25', studentId: 's1', status: 'present' },
];
exports.INITIAL_MESSAGES = [
    {
        id: 1,
        fromId: 'p1',
        toId: 't1',
        text: 'Hi Ms. Johnson, will Alex need boots for the trip?',
        image: '',
        timestamp: '10:30 AM',
        read: true,
        kind: 'direct',
    },
    {
        id: 2,
        fromId: 't1',
        toId: 'p1',
        text: 'Hi Mr. Smith! Yes, it might be muddy.',
        image: '',
        timestamp: '10:35 AM',
        read: true,
        kind: 'direct',
    },
    {
        id: 3,
        fromId: 'co1',
        toId: null,
        text: 'Welcome to KinderConnect. This is a coordinator broadcast message.',
        image: '',
        timestamp: '09:00 AM',
        read: true,
        kind: 'broadcast',
    },
];
exports.INITIAL_ROUTINES = [
    {
        id: 1,
        classId: 'c1',
        className: 'Sunshine Kindergarten (K1)',
        teacherId: 't1',
        teacherName: 'Ms. Johnson',
        dayOfWeek: 'sunday',
        startTime: '09:00',
        endTime: '09:45',
        title: 'Morning Circle',
    },
    {
        id: 2,
        classId: 'c1',
        className: 'Sunshine Kindergarten (K1)',
        teacherId: 't1',
        dayOfWeek: 'sunday',
        startTime: '10:00',
        endTime: '10:45',
        title: 'Phonics',
    },
    {
        id: 3,
        classId: 'c1',
        className: 'Sunshine Kindergarten (K1)',
        teacherId: 't1',
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '09:45',
        title: 'Story Time',
    },
];
