'use client';

import React from 'react';
import { RoutineBoard } from './RoutineBoard';
import { useAppContext } from '../../modules/shared/context/AppContext';
import { DayOfWeek } from '../../modules/shared/types';

const getDayOfWeek = (date: string): DayOfWeek => {
  const dayName = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return dayName as DayOfWeek;
};

export function RoutinesView() {
  const {
    user,
    routines,
    classes,
    allUsers,
    selectedClass,
    setSelectedClass,
    selectedChild,
    selectedDate,
    createRoutine,
    updateRoutine,
    deleteRoutine,
  } = useAppContext();

  const visibleClasses =
    user?.role === 'teacher'
      ? classes.filter((entry) => (entry.teacherIds ?? []).includes(user.id))
      : classes;
  const teachers = allUsers.filter((entry) => entry.role === 'teacher');
  const parentClassId = user?.role === 'parent' ? selectedChild?.classId ?? null : null;
  const activeClass =
    user?.role === 'parent'
      ? visibleClasses.find((entry) => entry.id === parentClassId) ?? null
      : visibleClasses.find((entry) => entry.id === selectedClass?.id) ?? visibleClasses[0] ?? null;

  React.useEffect(() => {
    if (user?.role === 'parent') {
      return;
    }

    if (!activeClass || selectedClass?.id === activeClass.id) {
      return;
    }

    setSelectedClass(activeClass);
  }, [activeClass, selectedClass, setSelectedClass, user]);

  if (!user) {
    return null;
  }

  return (
    <RoutineBoard
      routines={routines}
      classes={visibleClasses}
      teachers={teachers}
      activeClassId={activeClass?.id ?? null}
      onClassChange={
        user.role === 'parent'
          ? undefined
          : (classId) => {
              const nextClass = visibleClasses.find((entry) => entry.id === classId);
              if (nextClass) {
                setSelectedClass(nextClass);
              }
            }
      }
      editable={user.role === 'coordinator'}
      onCreateRoutine={createRoutine}
      onUpdateRoutine={updateRoutine}
      onDeleteRoutine={deleteRoutine}
      initialDay={getDayOfWeek(selectedDate)}
      title={user.role === 'coordinator' ? 'Routine Planner' : 'Weekly Routine'}
      subtitle={
        user.role === 'coordinator'
          ? 'Build class-wise periods for each day and keep teacher assignment inside the class roster.'
          : "Check today's class flow or switch to another day any time."
      }
    />
  );
}
