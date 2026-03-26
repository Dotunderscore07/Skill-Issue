import { useMemo, useEffect } from 'react';
import { useAppContext } from '../modules/shared/context/AppContext';
import { getDayOfWeek, formatDateFull, getGreeting } from '../lib/dateUtils';
import { User, AttendanceRecord, Announcement } from '../modules/shared/types';

export function useTeacherDashboard(user: User, attendance: AttendanceRecord[], announcements: Announcement[]) {
  const {
    updateUserProfile,
    students: allStudents,
    classes: allClasses,
    routines,
    allUsers,
    selectedClass,
    setSelectedClass,
    selectedDate,
  } = useAppContext();

  const teacherClasses = useMemo(() => allClasses.filter((entry) => (entry.teacherIds ?? []).includes(user.id)), [allClasses, user.id]);
  const availableClasses = teacherClasses.length > 0 ? teacherClasses : allClasses;

  useEffect(() => {
    if (availableClasses.length > 0 && (!selectedClass || !availableClasses.some((c) => c.id === selectedClass.id))) {
      setSelectedClass(availableClasses[0]);
    }
  }, [availableClasses, selectedClass, setSelectedClass]);

  const classStudents = useMemo(() => allStudents.filter((student) => student.classId === selectedClass?.id), [allStudents, selectedClass]);
  const totalStudents = classStudents.length;

  const parentsCount = useMemo(() => {
    const parentIds = new Set(classStudents.map((s) => s.parentId).filter(Boolean));
    return parentIds.size;
  }, [classStudents]);

  const presentCount = useMemo(() => attendance.filter(
    (entry) => entry.date === selectedDate && entry.status === 'present' && classStudents.some((student) => student.id === entry.studentId)
  ).length, [attendance, selectedDate, classStudents]);

  const visibleAnnouncements = useMemo(() => announcements.filter(
    (announcement) => !announcement.classId || announcement.classId === selectedClass?.id
  ), [announcements, selectedClass]);

  const teachers = useMemo(() => allUsers.filter((entry) => entry.role === 'teacher'), [allUsers]);
  const classTeachersCount = useMemo(() => teachers.filter((t) => (t.classIds ?? []).includes(selectedClass?.id ?? '')).length, [teachers, selectedClass]);

  const todayDay = getDayOfWeek(selectedDate);
  const formattedDate = formatDateFull(selectedDate);
  const greeting = getGreeting();

  const todaysRoutines = useMemo(() => {
    if (!selectedClass) return [];
    return routines
      .filter((routine) => routine.classId === selectedClass.id && routine.dayOfWeek === todayDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [routines, selectedClass, todayDay]);

  return {
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
  };
}
