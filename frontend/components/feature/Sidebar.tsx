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
        currentView === id
          ? 'bg-indigo-600 text-white shadow-md'
          : 'text-gray-600 hover:bg-indigo-50'
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
  return (
    <aside className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="bg-indigo-100 p-2 rounded-lg">
          <Baby className="text-indigo-600 w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-indigo-900">KinderConnect</span>
      </div>

      <div className="p-4 space-y-2 flex-1">
        <NavItem id="dashboard" icon={Home} label="Dashboard" currentView={view} onClick={onViewChange} />
        <NavItem id="messages" icon={MessageCircle} label="Messages" currentView={view} onClick={onViewChange} />
        <NavItem id="attendance" icon={Calendar} label="Attendance" currentView={view} onClick={onViewChange} />
        <NavItem id="announcements" icon={Bell} label="Announcements" currentView={view} onClick={onViewChange} />
        {user.role === 'parent' && (
          <NavItem id="activities" icon={BookOpen} label="Daily Activities" currentView={view} onClick={onViewChange} />
        )}
        {user.role === 'teacher' && (
          <NavItem id="activities" icon={BookOpen} label="Post Activity" currentView={view} onClick={onViewChange} />
        )}
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <span className="text-2xl">{user.avatar}</span>
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
