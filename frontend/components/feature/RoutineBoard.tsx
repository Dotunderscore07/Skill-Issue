'use client';

import React from 'react';
import { Clock3, PencilLine, Plus, Trash2, User as UserIcon } from 'lucide-react';
import { Button, Card } from '../ui';
import { Class, DayOfWeek, Routine, User } from '../../modules/shared/types';

export const DAY_LABELS: { key: DayOfWeek; label: string }[] = [
  { key: 'sunday', label: 'Sunday' },
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
];

interface RoutineBoardProps {
  routines: Routine[];
  classes: Class[];
  teachers: User[];
  activeClassId: string | null;
  onClassChange?: (classId: string) => void;
  editable?: boolean;
  onCreateRoutine?: (payload: RoutineFormState) => Promise<void>;
  onUpdateRoutine?: (id: number, payload: RoutineFormState) => Promise<void>;
  onDeleteRoutine?: (id: number) => Promise<void>;
  initialDay?: DayOfWeek;
  title?: string;
  subtitle?: string;
}

export interface RoutineFormState {
  classId: string;
  teacherId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  title: string;
}

const emptyForm = (classId = '', dayOfWeek: DayOfWeek = 'sunday'): RoutineFormState => ({
  classId,
  teacherId: '',
  dayOfWeek,
  startTime: '',
  endTime: '',
  title: '',
});

const formatTime = (value: string) =>
  new Date(`2000-01-01T${value}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function RoutineBoard({
  routines,
  classes,
  teachers,
  activeClassId,
  onClassChange,
  editable = false,
  onCreateRoutine,
  onUpdateRoutine,
  onDeleteRoutine,
  initialDay = 'sunday',
  title = 'Class Routine',
  subtitle = 'Move through the week and see each period for the selected class.',
}: RoutineBoardProps) {
  const [activeDay, setActiveDay] = React.useState<DayOfWeek>(initialDay);
  const [editingRoutineId, setEditingRoutineId] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<RoutineFormState>(emptyForm(activeClassId ?? classes[0]?.id ?? '', initialDay));

  React.useEffect(() => {
    setActiveDay(initialDay);
  }, [initialDay]);

  React.useEffect(() => {
    setForm((current) => {
      const nextClassId = current.classId || activeClassId || classes[0]?.id || '';
      return {
        ...current,
        classId: nextClassId,
        dayOfWeek: current.dayOfWeek || activeDay,
      };
    });
  }, [activeClassId, classes, activeDay]);

  const resolvedClassId = activeClassId ?? classes[0]?.id ?? null;
  const classForBoard = classes.find((entry) => entry.id === resolvedClassId) ?? null;
  const classForForm = classes.find((entry) => entry.id === form.classId) ?? classForBoard;
  const allowedTeacherIds = classForForm?.teacherIds ?? [];
  const availableTeachers = teachers.filter((teacher) => allowedTeacherIds.includes(teacher.id));
  const dayRoutines = routines
    .filter((routine) => routine.classId === resolvedClassId && routine.dayOfWeek === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  React.useEffect(() => {
    if (!form.classId) {
      return;
    }

    const targetClass = classes.find((entry) => entry.id === form.classId);
    const nextTeacherIds = targetClass?.teacherIds ?? [];
    if (nextTeacherIds.length === 0) {
      setForm((current) => ({ ...current, teacherId: '' }));
      return;
    }

    if (!nextTeacherIds.includes(form.teacherId)) {
      setForm((current) => ({ ...current, teacherId: nextTeacherIds[0] }));
    }
  }, [classes, form.classId, form.teacherId]);

  const resetForm = React.useCallback(() => {
    setEditingRoutineId(null);
    setForm(emptyForm(resolvedClassId ?? '', activeDay));
  }, [activeDay, resolvedClassId]);

  const startEdit = (routine: Routine) => {
    setEditingRoutineId(routine.id);
    setForm({
      classId: routine.classId,
      teacherId: routine.teacherId,
      dayOfWeek: routine.dayOfWeek,
      startTime: routine.startTime,
      endTime: routine.endTime,
      title: routine.title,
    });
    setActiveDay(routine.dayOfWeek);
    onClassChange?.(routine.classId);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.classId || !form.teacherId || !onCreateRoutine || !onUpdateRoutine) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRoutineId !== null) {
        await onUpdateRoutine(editingRoutineId, form);
      } else {
        await onCreateRoutine(form);
      }
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {onClassChange && (
              <select
                value={resolvedClassId ?? ''}
                onChange={(event) => onClassChange(event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
              >
                {classes.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        {DAY_LABELS.map((day) => (
          <button
            key={day.key}
            type="button"
            onClick={() => {
              setActiveDay(day.key);
              setForm((current) => ({ ...current, dayOfWeek: day.key }));
            }}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              activeDay === day.key
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                : 'border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {editable && (
        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Class <span className="text-red-500">*</span></label>
                <select
                  required
                  value={form.classId}
                  onChange={(event) => {
                    const nextClassId = event.target.value;
                    setForm((current) => ({ ...current, classId: nextClassId }));
                    onClassChange?.(nextClassId);
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700"
                >
                  {classes.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Day <span className="text-red-500">*</span></label>
                <select
                  required
                  value={form.dayOfWeek}
                  onChange={(event) => {
                    const nextDay = event.target.value as DayOfWeek;
                    setForm((current) => ({ ...current, dayOfWeek: nextDay }));
                    setActiveDay(nextDay);
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700"
                >
                  {DAY_LABELS.map((day) => (
                    <option key={day.key} value={day.key}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Teacher <span className="text-red-500">*</span></label>
                <select
                  required
                  value={form.teacherId}
                  onChange={(event) => setForm((current) => ({ ...current, teacherId: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700"
                >
                  {availableTeachers.length === 0 ? (
                    <option value="">No teachers assigned to this class</option>
                  ) : (
                    availableTeachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Time <span className="text-red-500">*</span></label>
                <input
                  required
                  type="time"
                  value={form.startTime}
                  onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Time <span className="text-red-500">*</span></label>
                <input
                  required
                  type="time"
                  value={form.endTime}
                  onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700"
                />
              </div>
              <div className="space-y-2 md:col-span-2 xl:col-span-1">
                <label className="text-sm font-medium text-gray-700">Activity / Subject <span className="text-red-500">*</span></label>
                <input
                  required
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Phonics, Circle Time, Art..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              {editingRoutineId !== null && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Go Back
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting || availableTeachers.length === 0}>
                {editingRoutineId !== null ? 'Save Period' : 'Create Period'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="grid grid-cols-[110px_minmax(0,1fr)] border-b border-gray-100 px-6 py-4 text-sm font-semibold text-gray-500">
          <span>Time</span>
          <span>{editable ? 'Periods' : 'Routine'}</span>
        </div>
        <div className="space-y-4 p-6">
          {dayRoutines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
              <Clock3 className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              <p className="font-semibold text-gray-700">No periods scheduled for {DAY_LABELS.find((day) => day.key === activeDay)?.label}.</p>
              <p className="mt-1 text-sm text-gray-500">
                {editable ? 'Use the form above to add the first routine period.' : 'Try another day or class.'}
              </p>
            </div>
          ) : (
            dayRoutines.map((routine) => (
              <div key={routine.id} className="grid grid-cols-[110px_minmax(0,1fr)] gap-4">
                <div className="flex flex-col justify-center text-sm font-semibold text-gray-700">
                  <span>{formatTime(routine.startTime)}</span>
                  <span className="text-gray-400">{formatTime(routine.endTime)}</span>
                </div>
                <div className="rounded-2xl border border-sky-200 bg-sky-100/80 px-5 py-4 shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{routine.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-700">
                        <span className="inline-flex items-center gap-2">
                          <UserIcon size={16} />
                          {routine.teacherName ?? 'Unassigned Teacher'}
                        </span>
                        <span>{routine.className ?? classForBoard?.name}</span>
                      </div>
                    </div>
                    {editable && (
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => startEdit(routine)}>
                          <PencilLine size={16} />
                          Edit
                        </Button>
                        <Button variant="danger" onClick={() => onDeleteRoutine?.(routine.id)}>
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
