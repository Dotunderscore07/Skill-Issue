'use client';

import React from 'react';
import { User, Announcement } from '../../modules/shared/types';
import { useParentDashboard } from '../../hooks/useParentDashboard';
import { ChildSwitcher } from './parent/ChildSwitcher';
import { ProfileSection } from './parent/ProfileSection';
import { RoutineSection } from './parent/RoutineSection';
import { AnnouncementSection } from './parent/AnnouncementSection';

interface ParentDashboardProps {
  user: User;
  announcements: Announcement[];
}

export function ParentDashboard({ user, announcements }: ParentDashboardProps) {
  const {
    loading,
    myChildren,
    selectedChild,
    setSelectedChild,
    todaysRoutines,
    visibleAnnouncements,
    formattedDate,
    greeting,
    updateUserProfile,
    updateStudent,
  } = useParentDashboard(user, announcements);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your dashboard...</div>;

  if (myChildren.length === 0 || !selectedChild) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Hang tight!</h2>
        <p>Your account is not linked to a student yet. Please ask the teacher or coordinator to assign your child.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ChildSwitcher 
        children={myChildren} 
        selectedChild={selectedChild} 
        onSelect={setSelectedChild} 
      />

      <ProfileSection 
        user={user} 
        selectedChild={selectedChild} 
        getGreeting={() => greeting}
        updateUserProfile={updateUserProfile}
        updateStudent={updateStudent}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoutineSection 
          routines={todaysRoutines} 
          formattedDate={formattedDate} 
        />
        <AnnouncementSection 
          announcements={visibleAnnouncements} 
        />
      </div>
    </div>
  );
}
