import { useMemo, useEffect } from 'react';
import { useAppContext } from '../modules/shared/context/AppContext';
import { getDayOfWeek, formatDateFull } from '../lib/dateUtils';
import { UserSquare2, Users } from 'lucide-react';
import { User } from '../modules/shared/types';

export function useCoordinatorDashboard() {
  const {
    coordinatorSummary,
    routines,
    classes: allClasses,
    allUsers,
    selectedClass,
    setSelectedClass,
    selectedDate,
    updateUserProfile,
  } = useAppContext();

  useEffect(() => {
    if (allClasses.length > 0 && (!selectedClass || !allClasses.some((c) => c.id === selectedClass.id))) {
      setSelectedClass(allClasses[0]);
    }
  }, [allClasses, selectedClass, setSelectedClass]);

  const todayDay = getDayOfWeek(selectedDate);
  const formattedDate = formatDateFull(selectedDate);

  const todaysRoutines = useMemo(() => {
    if (!selectedClass) return [];
    return routines
      .filter((routine) => routine.classId === selectedClass.id && routine.dayOfWeek === todayDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [routines, selectedClass, todayDay]);

  const stats = useMemo(() => [
    { label: 'Teachers', value: coordinatorSummary?.totalTeachers ?? 0, icon: UserSquare2, accent: 'border-l-sky-500 bg-sky-100 text-sky-600' },
    { label: 'Children', value: coordinatorSummary?.totalChildren ?? 0, icon: Users, accent: 'border-l-emerald-500 bg-emerald-100 text-emerald-600' },
    { label: 'Parents', value: coordinatorSummary?.totalParents ?? 0, icon: Users, accent: 'border-l-amber-500 bg-amber-100 text-amber-600' },
  ], [coordinatorSummary]);

  return {
    coordinatorSummary,
    allClasses,
    selectedClass,
    setSelectedClass,
    todaysRoutines,
    formattedDate,
    stats,
    updateUserProfile,
  };
}
