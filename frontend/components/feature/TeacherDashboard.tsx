'use client';

import React from 'react';
import { Clock3, Users, Calendar, Plus, Megaphone } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { User, Announcement, AttendanceRecord } from '../../modules/shared/types';
import { useAppContext } from '../../modules/shared/context/AppContext';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const getDayOfWeek = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';

interface TeacherDashboardProps {
  user: User;
  attendance: AttendanceRecord[];
  announcements: Announcement[];
  onNavigate: (view: 'announcements' | 'messages') => void;
}

export function TeacherDashboard({ user, attendance, announcements, onNavigate }: TeacherDashboardProps) {
  const {
    students: allStudents,
    classes: allClasses,
    routines,
    allUsers,
    selectedClass,
    setSelectedClass,
    selectedDate,
  } = useAppContext();

  const teacherClasses = allClasses.filter((entry) => (entry.teacherIds ?? []).includes(user.id));
  const availableClasses = teacherClasses.length > 0 ? teacherClasses : allClasses;
  const classStudents = allStudents.filter((student) => student.classId === selectedClass?.id);
  const totalStudents = classStudents.length;

  const parentIds = new Set(classStudents.map((s) => s.parentId).filter(Boolean));
  const parentsCount = parentIds.size;

  const presentCount = attendance.filter(
    (entry) => entry.date === selectedDate && entry.status === 'present' && classStudents.some((student) => student.id === entry.studentId)
  ).length;
  const visibleAnnouncements = announcements.filter(
    (announcement) => !announcement.classId || announcement.classId === selectedClass?.id
  );
  
  const teachers = allUsers.filter((entry) => entry.role === 'teacher');
  const classTeachersCount = teachers.filter((t) => (t.classIds ?? []).includes(selectedClass?.id ?? '')).length;

  React.useEffect(() => {
    if (availableClasses.length === 0) {
      return;
    }

    if (!selectedClass || !availableClasses.some((entry) => entry.id === selectedClass.id)) {
      setSelectedClass(availableClasses[0]);
    }
  }, [availableClasses, selectedClass, setSelectedClass]);

  const todayDay = getDayOfWeek(selectedDate);
  const todaysRoutines = routines
    .filter((routine) => routine.classId === selectedClass?.id && routine.dayOfWeek === todayDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const formatTime = (value: string) =>
    new Date(`2000-01-01T${value}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formattedDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{getGreeting()}, {user.name}!</h2>
          <div className="flex items-center gap-2 text-gray-500 mt-1">
            <span>Here&apos;s what&apos;s happening in</span>
            {availableClasses.length > 0 ? (
              <select
                className="bg-white border text-gray-700 px-2 py-1 rounded-md text-sm font-medium focus:outline-none focus:border-indigo-500"
                value={selectedClass?.id || ''}
                onChange={(e) => {
                  const targetClass = availableClasses.find((entry) => entry.id === e.target.value);
                  if (targetClass) setSelectedClass(targetClass);
                }}
              >
                {availableClasses.map((entry) => (
                  <option key={entry.id} value={entry.id}>{entry.name}</option>
                ))}
              </select>
            ) : (
              <span>your classroom</span>
            )}
            <span>today.</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => onNavigate('announcements')}>
            <Plus size={18} /> New Announcement
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="bg-green-100 p-3 rounded-full">
            <Users className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Attendance</p>
            <p className="text-2xl font-bold">{presentCount} / {totalStudents || '-'}</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Parents</p>
            <p className="text-2xl font-bold">{parentsCount}</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="bg-purple-100 p-3 rounded-full">
            <Users className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Teachers</p>
            <p className="text-2xl font-bold">{classTeachersCount}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Clock3 size={18} className="text-sky-600" />
            <h3 className="font-bold text-lg">
              Today&apos;s Routine <span className="text-gray-500 text-sm font-normal ml-2">{formattedDate}</span>
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {todaysRoutines.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
                <p className="font-semibold text-gray-700">No periods scheduled for today.</p>
                <p className="mt-1 text-sm text-gray-500">Open the routines tab to view the full weekly routine.</p>
              </div>
            ) : (
              todaysRoutines.map((routine) => (
                <div key={routine.id} className="grid grid-cols-[100px_minmax(0,1fr)] gap-4">
                  <div className="flex flex-col justify-center text-sm font-semibold text-gray-700">
                    <span>{formatTime(routine.startTime)}</span>
                    <span className="text-gray-400">{formatTime(routine.endTime)}</span>
                  </div>
                  <div className="rounded-2xl border border-sky-200 bg-sky-100/80 px-5 py-4 shadow-sm">
                    <p className="text-lg font-bold text-gray-900">{routine.title}</p>
                    <p className="mt-2 text-sm text-gray-700">{routine.teacherName ?? teachers.find((entry) => entry.id === routine.teacherId)?.name ?? 'Assigned teacher'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Megaphone size={18} className="text-indigo-600" />
            <h3 className="font-bold text-lg">Recent Announcements</h3>
          </div>
          <div className="p-4 space-y-4">
            {visibleAnnouncements.slice(0, 3).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
                <p className="font-semibold text-gray-700">No announcements yet.</p>
              </div>
            ) : (
              visibleAnnouncements.slice(0, 3).map((announcement) => (
                <div key={announcement.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge color={announcement.type === 'urgent' ? 'red' : announcement.type === 'event' ? 'green' : 'blue'}>
                        {announcement.type}
                      </Badge>
                      <span className="text-xs text-gray-500">{announcement.className ?? 'All Classes'}</span>
                    </div>
                    <span className="text-xs text-gray-400">{announcement.date}</span>
                  </div>
                  <p className="text-sm text-gray-800">{announcement.text}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
