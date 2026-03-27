'use client';

import React from 'react';
import { User } from '../../modules/shared/types';
import { useCoordinatorDashboard } from '../../hooks/useCoordinatorDashboard';
import { StatsGrid } from './coordinator/StatsGrid';
import { CoordinatorProfileSection } from './coordinator/CoordinatorProfileSection';
import { CoordinatorRoutineSection } from './coordinator/CoordinatorRoutineSection';
import { AnnouncementSection } from './parent/AnnouncementSection'; // Reusing generic section

interface CoordinatorDashboardProps {
  user: User;
}

export function CoordinatorDashboard({ user }: CoordinatorDashboardProps) {
  const {
    coordinatorSummary,
    allClasses,
    selectedClass,
    setSelectedClass,
    todaysRoutines,
    formattedDate,
    stats,
    updateUserProfile,
  } = useCoordinatorDashboard();

  return (
    <div className="space-y-6">
      <CoordinatorProfileSection 
        user={user} 
        updateUserProfile={updateUserProfile} 
      />

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CoordinatorRoutineSection 
          routines={todaysRoutines}
          allClasses={allClasses}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          formattedDate={formattedDate}
        />
        
        <AnnouncementSection 
          announcements={coordinatorSummary?.announcements ?? []} 
        />
      </div>
    </div>
  );
}
