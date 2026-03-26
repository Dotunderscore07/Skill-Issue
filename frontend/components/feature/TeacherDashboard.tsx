'use client';

import React from 'react';
import { User, Announcement, AttendanceRecord } from '../../modules/shared/types';
import { useTeacherDashboard } from '../../hooks/useTeacherDashboard';
import { TeacherProfileSection } from './teacher/TeacherProfileSection';
import { TeacherStatsGrid } from './teacher/TeacherStatsGrid';
import { RoutineSection } from './parent/RoutineSection'; // Reusing generic section
import { AnnouncementSection } from './parent/AnnouncementSection'; // Reusing generic section

interface TeacherDashboardProps {
  user: User;
  attendance: AttendanceRecord[];
  announcements: Announcement[];
  onNavigate: (view: 'announcements' | 'messages') => void;
}

export function TeacherDashboard({ user, attendance, announcements, onNavigate }: TeacherDashboardProps) {
  const {
    updateUserProfile,
    availableClasses,
    selectedClass,
    setSelectedClass,
    totalStudents,
    parentsCount,
    presentCount,
    visibleAnnouncements,
    classTeachersCount,
    todaysRoutines,
    formattedDate,
    greeting,
  } = useTeacherDashboard(user, attendance, announcements);

  return (
    <div className="space-y-6">
      <TeacherProfileSection 
        user={user}
        greeting={greeting}
        availableClasses={availableClasses}
        selectedClassId={selectedClass?.id || ''}
        onClassChange={(id) => {
          const target = availableClasses.find(c => c.id === id);
          if (target) setSelectedClass(target);
        }}
        onNavigate={onNavigate}
        updateUserProfile={updateUserProfile}
      />

      <TeacherStatsGrid 
        presentCount={presentCount}
        totalStudents={totalStudents}
        parentsCount={parentsCount}
        classTeachersCount={classTeachersCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoutineSection 
          routines={todaysRoutines} 
          formattedDate={formattedDate} 
        />
        
        <AnnouncementSection 
          announcements={visibleAnnouncements.slice(0, 3)} 
        />
      </div>
    </div>
  );
}
