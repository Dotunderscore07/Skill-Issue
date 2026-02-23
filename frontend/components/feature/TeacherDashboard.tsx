'use client';

import React from 'react';
import { Users, MessageCircle, Calendar, Plus } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { User, Student, Announcement, AttendanceRecord } from '../../modules/shared/types';
import { MOCK_STUDENTS, MOCK_USERS } from '../../modules/shared/data/mockData';

interface TeacherDashboardProps {
  user: User;
  attendance: AttendanceRecord[];
  announcements: Announcement[];
  onNavigate: (view: 'announcements' | 'messages') => void;
}

export function TeacherDashboard({
  user,
  attendance,
  announcements,
  onNavigate,
}: TeacherDashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  const presentCount = attendance.filter((a) => a.date === today && a.status === 'present').length;
  const totalStudents = MOCK_STUDENTS.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Good Morning, {user.name}! ☀️</h2>
          <p className="text-gray-500">Here&apos;s what&apos;s happening in Class K1 today.</p>
        </div>
        <Button onClick={() => onNavigate('announcements')}>
          <Plus size={18} /> New Announcement
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="bg-green-100 p-3 rounded-full">
            <Users className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Attendance</p>
            <p className="text-2xl font-bold">
              {presentCount} / {totalStudents}
            </p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="bg-blue-100 p-3 rounded-full">
            <MessageCircle className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Unread Messages</p>
            <p className="text-2xl font-bold">2</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="bg-purple-100 p-3 rounded-full">
            <Calendar className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Upcoming Events</p>
            <p className="text-2xl font-bold">1</p>
          </div>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-lg">Class Roster</h3>
            <span className="text-xs text-gray-400">Total: {MOCK_STUDENTS.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {MOCK_STUDENTS.map((student: Student) => (
              <div key={student.id} className="p-4 flex items-center gap-3 hover:bg-gray-50">
                <span className="text-2xl">{student.avatar}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-500">
                    Parent: {MOCK_USERS.find((u) => u.id === student.parentId)?.name}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="text-xs px-2 py-1 h-8"
                  onClick={() => onNavigate('messages')}
                >
                  Message
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-lg">Recent Announcements</h3>
          </div>
          <div className="p-4 space-y-4">
            {announcements.slice(0, 2).map((a) => (
              <div key={a.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <div className="flex justify-between items-start mb-1">
                  <Badge color={a.type === 'urgent' ? 'red' : 'blue'}>{a.type}</Badge>
                  <span className="text-xs text-gray-500">{a.date}</span>
                </div>
                <p className="text-sm text-gray-800">{a.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
