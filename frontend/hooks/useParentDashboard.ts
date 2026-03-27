import { useMemo } from 'react';
import { useAppContext } from '../modules/shared/context/AppContext';
import { getDayOfWeek, formatDateFull, getGreeting } from '../lib/dateUtils';
import { User, Announcement } from '../modules/shared/types';

export function useParentDashboard(user: User, announcements: Announcement[]) {
  const {
    students,
    selectedChild,
    setSelectedChild,
    routines,
    classes,
    selectedDate,
    authLoading: loading,
    updateUserProfile,
    updateStudent,
  } = useAppContext();

  const myChildren = useMemo(() => students.filter((student) => student.parentId === user.id), [students, user.id]);
  
  const today = getDayOfWeek(selectedDate);
  const formattedDate = formatDateFull(selectedDate);
  const greeting = getGreeting();

  const todaysRoutines = useMemo(() => {
    if (!selectedChild) return [];
    return routines
      .filter((routine) => routine.classId === selectedChild.classId && routine.dayOfWeek === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [routines, selectedChild, today]);

  const visibleAnnouncements = useMemo(() => {
    if (!selectedChild) return [];
    return announcements
      .filter((a) => !a.classId || a.classId === selectedChild.classId)
      .slice(0, 5);
  }, [announcements, selectedChild]);

  const childClass = useMemo(() => {
    if (!selectedChild) return null;
    return classes.find((c) => c.id === selectedChild.classId);
  }, [classes, selectedChild]);

  return {
    loading,
    myChildren,
    selectedChild,
    setSelectedChild,
    todaysRoutines,
    visibleAnnouncements,
    childClass,
    formattedDate,
    greeting,
    updateUserProfile,
    updateStudent,
  };
}
