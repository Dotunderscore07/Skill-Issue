'use client';

import React from 'react';
import { BookOpen, Bell } from 'lucide-react';
import { Card } from '../ui';
import { User, Activity, Announcement } from '../../modules/shared/types';
import { MOCK_STUDENTS } from '../../modules/shared/data/mockData';

interface ParentDashboardProps {
  user: User;
  activities: Activity[];
  announcements: Announcement[];
}

export function ParentDashboard({ user, activities, announcements }: ParentDashboardProps) {
  const student = MOCK_STUDENTS.find((s) => s.id === user.studentId);

  if (!student) return null;

  const todayActivity = activities.filter(
    (a) => a.studentId === student.id && a.date === '2023-10-26'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-4xl shadow-inner">
          {student.avatar}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{student.name}&apos;s Profile</h2>
          <p className="text-gray-500">Class K1 • Sunshine Kindergarten</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" />
            <h3 className="font-bold">Today&apos;s Activity</h3>
          </div>
          <div className="p-4 space-y-4">
            {todayActivity.length > 0 ? (
              todayActivity.map((act, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-gray-800">{act.text}</p>
                    <span className="text-xs text-gray-400 mt-1 block capitalize">
                      Mood: {act.mood}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic text-center py-4">No updates yet today.</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Bell size={18} className="text-yellow-600" />
            <h3 className="font-bold">Notice Board</h3>
          </div>
          <div className="p-4 space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <p className="text-sm text-gray-800 font-medium">{a.text}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {a.author} • {a.date}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
