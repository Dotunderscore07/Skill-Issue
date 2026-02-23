'use client';

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TeacherDashboard } from './TeacherDashboard';
import { ParentDashboard } from './ParentDashboard';
import { AttendanceView } from './AttendanceView';
import { AnnouncementsView } from './AnnouncementsView';
import { MessagingSystem } from './MessagingSystem';
import { ActivitiesView } from './ActivitiesView';
import { useAppContext } from '../../modules/shared/context/AppContext';
import { ViewType } from '../../modules/shared/types';

export function AuthenticatedLayout() {
  const {
    user,
    view,
    announcements,
    activities,
    attendance,
    messages,
    logout,
    setView,
    addAnnouncement,
    addActivity,
    updateAttendance,
    sendMessage,
  } = useAppContext();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return null;

  const handleViewChange = (v: ViewType) => {
    setView(v);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return user.role === 'teacher' ? (
          <TeacherDashboard
            user={user}
            attendance={attendance}
            announcements={announcements}
            onNavigate={(v) => setView(v as ViewType)}
          />
        ) : (
          <ParentDashboard user={user} activities={activities} announcements={announcements} />
        );
      case 'messages':
        return (
          <MessagingSystem user={user} messages={messages} onSend={sendMessage} />
        );
      case 'attendance':
        return (
          <AttendanceView
            user={user}
            attendance={attendance}
            onUpdateAttendance={updateAttendance}
          />
        );
      case 'announcements':
        return (
          <AnnouncementsView
            user={user}
            announcements={announcements}
            onAdd={addAnnouncement}
          />
        );
      case 'activities':
        return (
          <ActivitiesView
            user={user}
            activities={activities}
            onAddActivity={addActivity}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex text-gray-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar
          user={user}
          view={view}
          onViewChange={handleViewChange}
          onLogout={logout}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600"
          >
            <Menu />
          </button>
          <span className="font-bold text-gray-900">
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </span>
          <div className="w-8" />
        </header>

        <div className="p-4 md:p-8 max-w-5xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
}
