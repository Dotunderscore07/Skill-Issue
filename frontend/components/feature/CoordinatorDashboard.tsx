'use client';

import React from 'react';
import { Megaphone, Shapes, Users, UserSquare2 } from 'lucide-react';
import { Card, Badge } from '../ui';
import { Announcement, User } from '../../modules/shared/types';
import { useAppContext } from '../../modules/shared/context/AppContext';

interface CoordinatorDashboardProps {
  user: User;
}

export function CoordinatorDashboard({ user }: CoordinatorDashboardProps) {
  const { coordinatorSummary } = useAppContext();

  const stats = [
    { label: 'Teachers', value: coordinatorSummary?.totalTeachers ?? 0, icon: UserSquare2, accent: 'border-l-sky-500 bg-sky-100 text-sky-600' },
    { label: 'Children', value: coordinatorSummary?.totalChildren ?? 0, icon: Users, accent: 'border-l-emerald-500 bg-emerald-100 text-emerald-600' },
    { label: 'Parents', value: coordinatorSummary?.totalParents ?? 0, icon: Users, accent: 'border-l-amber-500 bg-amber-100 text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <p className="text-sm font-medium text-indigo-600 mb-2">Coordinator Dashboard</p>
        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
        <p className="text-gray-500 mt-1">Overview of teaching staff, enrolled children, parents, and recent announcements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className="p-5 flex items-center gap-4 border-l-4">
            <div className={`p-3 rounded-full ${accent}`}>
              <Icon />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Megaphone size={18} className="text-indigo-600" />
          <h3 className="font-bold text-lg">Recent Announcements</h3>
        </div>
        <div className="p-4 space-y-4">
          {(coordinatorSummary?.announcements ?? []).map((announcement: Announcement) => (
            <div key={announcement.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Badge color={announcement.type === 'urgent' ? 'red' : announcement.type === 'event' ? 'green' : 'blue'}>
                    {announcement.type}
                  </Badge>
                  <span className="text-xs text-gray-500">{announcement.author}</span>
                </div>
                <span className="text-xs text-gray-400">{announcement.date}</span>
              </div>
              <p className="text-sm text-gray-800">{announcement.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
