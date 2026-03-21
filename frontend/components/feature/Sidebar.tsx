'use client';

import React from 'react';
import {
  Baby,
  Home,
  MessageCircle,
  Calendar,
  Bell,
  BookOpen,
  LogOut,
  Shapes,
  Users,
} from 'lucide-react';
import { User, ViewType } from '../../modules/shared/types';
import { Button } from '../ui';

interface NavItemProps {
  id: ViewType;
  icon: React.ElementType;
  label: string;
  currentView: ViewType;
  onClick: (view: ViewType) => void;
}

function NavItem({ id, icon: Icon, label, currentView, onClick }: NavItemProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        currentView === id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-indigo-50'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );
}

interface SidebarProps {
  user: User;
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
}

export function Sidebar({ user, view, onViewChange, onLogout }: SidebarProps) {
  const navItems =
    user.role === 'coordinator'
      ? [
          { id: 'dashboard' as ViewType, icon: Home, label: 'Dashboard' },
          { id: 'teachers' as ViewType, icon: Users, label: 'Teachers' },
          { id: 'children' as ViewType, icon: Baby, label: 'Children' },
          { id: 'classes' as ViewType, icon: Shapes, label: 'Classes' },
          { id: 'announcements' as ViewType, icon: Bell, label: 'Announcements' },
          { id: 'messages' as ViewType, icon: MessageCircle, label: 'Messages' },
        ]
      : [
          { id: 'dashboard' as ViewType, icon: Home, label: 'Dashboard' },
          { id: 'messages' as ViewType, icon: MessageCircle, label: 'Messages' },
          { id: 'attendance' as ViewType, icon: Calendar, label: 'Attendance' },
          { id: 'announcements' as ViewType, icon: Bell, label: 'Announcements' },
          {
            id: 'activities' as ViewType,
            icon: BookOpen,
            label: user.role === 'parent' ? 'Daily Activities' : 'Post Activity',
          },
        ];

  return (
    <aside className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="bg-indigo-100 p-2 rounded-lg">
          <Baby className="text-indigo-600 w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-indigo-900">KinderConnect</span>
      </div>

      <div className="p-4 space-y-2 flex-1">
        {navItems.map((item) => (
          <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} currentView={view} onClick={onViewChange} />
        ))}
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <span className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
            {user.avatar}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 justify-start"
          onClick={onLogout}
        >
          <LogOut size={18} /> Sign Out
        </Button>
      </div>
    </aside>
  );
}
