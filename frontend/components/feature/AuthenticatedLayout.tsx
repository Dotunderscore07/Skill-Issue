'use client';

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TeacherDashboard } from './TeacherDashboard';
import { ParentDashboard } from './ParentDashboard';
import { CoordinatorDashboard } from './CoordinatorDashboard';
import { AttendanceView } from './AttendanceView';
import { AnnouncementsView } from './AnnouncementsView';
import { MessagingSystem } from './MessagingSystem';
import { ActivitiesView } from './ActivitiesView';
import { TeachersView } from './TeachersView';
import { ChildrenView } from './ChildrenView';
import { ClassesView } from './ClassesView';
import { CoordinatorMessagesView } from './CoordinatorMessagesView';
import { RoutinesView } from './RoutinesView';
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
    editActivity,
    deleteActivity,
    updateAttendance,
    sendMessage,
  } = useAppContext();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return null;

  const handleViewChange = (nextView: ViewType) => {
    setView(nextView);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    if (user.role === 'coordinator') {
      switch (view) {
        case 'dashboard':
          return <CoordinatorDashboard user={user} />;
        case 'teachers':
          return <TeachersView />;
        case 'children':
          return <ChildrenView />;
        case 'classes':
          return <ClassesView />;
        case 'routines':
          return <RoutinesView />;
        case 'announcements':
          return <AnnouncementsView user={user} announcements={announcements} onAdd={addAnnouncement} />;
        case 'messages':
          return <CoordinatorMessagesView />;
        default:
          return <CoordinatorDashboard user={user} />;
      }
    }

    switch (view) {
      case 'dashboard':
        return user.role === 'teacher' ? (
          <TeacherDashboard
            user={user}
            attendance={attendance}
            announcements={announcements}
            onNavigate={(nextView) => setView(nextView as ViewType)}
          />
        ) : (
          <ParentDashboard user={user} activities={activities} announcements={announcements} />
        );
      case 'messages':
        return <MessagingSystem user={user} messages={messages} onSend={sendMessage} />;
      case 'routines':
        return <RoutinesView />;
      case 'attendance':
        return <AttendanceView user={user} attendance={attendance} onUpdateAttendance={updateAttendance} />;
      case 'announcements':
        return <AnnouncementsView user={user} announcements={announcements} onAdd={addAnnouncement} />;
      case 'activities':
        return (
          <ActivitiesView
            user={user}
            activities={activities}
            onAddActivity={addActivity}
            onEditActivity={editActivity}
            onDeleteActivity={deleteActivity}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex text-gray-900">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar user={user} view={view} onViewChange={handleViewChange} onLogout={logout} />
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between md:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600">
            <Menu />
          </button>
          <span className="font-bold text-gray-900">{view.charAt(0).toUpperCase() + view.slice(1)}</span>
          <div className="w-8" />
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
}
