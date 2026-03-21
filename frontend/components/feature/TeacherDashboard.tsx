'use client';

import React from 'react';
import { Users, MessageCircle, Calendar, Plus } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { User, Announcement, AttendanceRecord } from '../../modules/shared/types';
import { useAppContext } from '../../modules/shared/context/AppContext';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const buildMonthGrid = (date: string) => {
  const [year, month] = date.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = Array.from({ length: startOffset }, () => null as number | null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

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
    selectedClass,
    setSelectedClass,
    selectedDate,
    setSelectedDate,
  } = useAppContext();

  const teacherClasses = allClasses.filter((entry) => (entry.teacherIds ?? []).includes(user.id));
  const availableClasses = teacherClasses.length > 0 ? teacherClasses : allClasses;
  const classStudents = allStudents.filter((student) => student.classId === selectedClass?.id);
  const totalStudents = classStudents.length;
  const presentCount = attendance.filter(
    (entry) => entry.date === selectedDate && entry.status === 'present' && classStudents.some((student) => student.id === entry.studentId)
  ).length;
  const monthGrid = buildMonthGrid(selectedDate);
  const today = new Date();
  const selectedMonth = new Date(selectedDate);
  const visibleAnnouncements = announcements.filter(
    (announcement) => !announcement.classId || announcement.classId === selectedClass?.id
  );

  React.useEffect(() => {
    if (availableClasses.length === 0) {
      return;
    }

    if (!selectedClass || !availableClasses.some((entry) => entry.id === selectedClass.id)) {
      setSelectedClass(availableClasses[0]);
    }
  }, [availableClasses, selectedClass, setSelectedClass]);

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
          <input
            type="date"
            className="p-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
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
            <MessageCircle className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Classroom Students</p>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="bg-purple-100 p-3 rounded-full">
            <Calendar className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Announcements</p>
            <p className="text-2xl font-bold">{announcements.length}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Class Calendar</h3>
              <p className="text-xs text-gray-400 mt-1">Selected date: {selectedDate}</p>
            </div>
            {selectedClass && <Badge color="indigo">{selectedClass.name}</Badge>}
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-400 mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthGrid.map((day, index) => {
                const isSelected =
                  day !== null &&
                  day === selectedMonth.getDate() &&
                  selectedMonth.getMonth() === new Date(selectedDate).getMonth() &&
                  selectedMonth.getFullYear() === new Date(selectedDate).getFullYear();
                const isToday =
                  day !== null &&
                  day === today.getDate() &&
                  selectedMonth.getMonth() === today.getMonth() &&
                  selectedMonth.getFullYear() === today.getFullYear();

                return (
                  <button
                    key={`${day ?? 'blank'}-${index}`}
                    type="button"
                    disabled={day === null}
                    onClick={() => {
                      if (day === null) return;
                      const nextDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
                      setSelectedDate(nextDate.toISOString().split('T')[0]);
                    }}
                    className={`h-10 rounded-xl text-sm ${
                      day === null
                        ? 'bg-transparent'
                        : isSelected
                        ? 'bg-indigo-600 text-white'
                        : isToday
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {day ?? ''}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-lg">Recent Announcements</h3>
          </div>
          <div className="p-4 space-y-4">
            {visibleAnnouncements.slice(0, 3).map((announcement) => (
              <div key={announcement.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <Badge color={announcement.type === 'urgent' ? 'red' : 'blue'}>{announcement.type}</Badge>
                    <span className="text-xs text-gray-500">
                      {announcement.className ?? 'All Classes'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{announcement.date}</span>
                </div>
                <p className="text-sm text-gray-800">{announcement.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
