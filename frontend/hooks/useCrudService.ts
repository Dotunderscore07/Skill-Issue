import { useCallback } from 'react';
import {
  Student,
  Class,
  Routine,
  User,
  DayOfWeek
} from '../modules/shared/types';
import {
  StudentApi,
  ClassApi,
  TeacherApi,
  RoutineApi,
} from '../lib/api-client';

interface TeacherPayload {
  name: string;
  phone: string;
  password: string;
  classIds: string[];
  avatar?: string;
}

interface UpdateTeacherPayload {
  name: string;
  phone: string;
  password?: string;
  classIds: string[];
  avatar?: string;
}

interface StudentPayload {
  name: string;
  dob: string;
  photo: string;
  parentId?: string;
  classId: string;
}

interface ClassPayload {
  name: string;
  teacherIds: string[];
}

interface RoutinePayload {
  classId: string;
  teacherId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  title: string;
}

export function useCrudService(
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>,
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>,
  setClasses: React.Dispatch<React.SetStateAction<Class[]>>,
  setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>,
  setCoordinatorSummary: React.Dispatch<React.SetStateAction<any>>,
  syncTeacherAssignments: (id: string, ids: string[]) => void,
  syncTeacherClassIds: (record: Record<string, string[]>) => void
) {
  const createTeacher = useCallback(async (payload: TeacherPayload) => {
    const created = await TeacherApi.create(payload);
    setAllUsers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    syncTeacherAssignments(created.id, created.classIds ?? payload.classIds);
    setCoordinatorSummary((prev: any) => (prev ? { ...prev, totalTeachers: (prev.totalTeachers || 0) + 1 } : prev));
  }, [setAllUsers, syncTeacherAssignments, setCoordinatorSummary]);

  const updateTeacher = useCallback(async (id: string, payload: UpdateTeacherPayload) => {
    const updated = await TeacherApi.update(id, payload);
    setAllUsers((prev) => prev.map((entry) => (entry.id === id ? updated : entry)));
    syncTeacherAssignments(updated.id, updated.classIds ?? payload.classIds);
  }, [setAllUsers, syncTeacherAssignments]);

  const deleteTeacher = useCallback(async (id: string) => {
    await TeacherApi.delete(id);
    setAllUsers((prev) => prev.filter((entry) => entry.id !== id));
    setCoordinatorSummary((prev: any) => (prev ? { ...prev, totalTeachers: Math.max(0, (prev.totalTeachers || 0) - 1) } : prev));
  }, [setAllUsers, setCoordinatorSummary]);

  const createStudent = useCallback(async (payload: StudentPayload) => {
    const created = await StudentApi.create(payload);
    setStudents((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setCoordinatorSummary((prev: any) => (prev ? { ...prev, totalChildren: (prev.totalChildren || 0) + 1 } : prev));
  }, [setStudents, setCoordinatorSummary]);

  const updateStudent = useCallback(async (id: string, payload: StudentPayload) => {
    const updated = await StudentApi.update(id, payload);
    setStudents((prev) => prev.map((entry) => (entry.id === id ? updated : entry)));
  }, [setStudents]);

  const deleteStudent = useCallback(async (id: string) => {
    await StudentApi.delete(id);
    setStudents((prev) => prev.filter((entry) => entry.id !== id));
    setCoordinatorSummary((prev: any) => (prev ? { ...prev, totalChildren: Math.max(0, (prev.totalChildren || 0) - 1) } : prev));
  }, [setStudents, setCoordinatorSummary]);

  const createClass = useCallback(async (payload: ClassPayload) => {
    const created = await ClassApi.create(payload);
    setClasses((prev) => {
      const nextClasses = [...prev, created].sort((a, b) => a.name.localeCompare(b.name));
      syncTeacherClassIds(Object.fromEntries(nextClasses.map((entry) => [entry.id, entry.teacherIds ?? []])));
      return nextClasses;
    });
  }, [setClasses, syncTeacherClassIds]);

  const updateClass = useCallback(async (id: string, payload: ClassPayload) => {
    const updated = await ClassApi.update(id, payload);
    setClasses((prev) => {
      const nextClasses = prev.map((entry) => (entry.id === id ? updated : entry));
      syncTeacherClassIds(Object.fromEntries(nextClasses.map((entry) => [entry.id, entry.teacherIds ?? []])));
      return nextClasses;
    });
  }, [setClasses, syncTeacherClassIds]);

  const deleteClass = useCallback(async (id: string) => {
    await ClassApi.delete(id);
    setClasses((prev) => prev.filter((entry) => entry.id !== id));
  }, [setClasses]);

  const createRoutine = useCallback(async (payload: RoutinePayload) => {
    const created = await RoutineApi.create(payload);
    setRoutines((prev) =>
      [...prev, created].sort((a, b) =>
        `${a.dayOfWeek}-${a.startTime}-${a.id}`.localeCompare(`${b.dayOfWeek}-${b.startTime}-${b.id}`)
      )
    );
  }, [setRoutines]);

  const updateRoutine = useCallback(async (id: number, payload: RoutinePayload) => {
    const updated = await RoutineApi.update(id, payload);
    setRoutines((prev) =>
      prev
        .map((entry) => (entry.id === id ? updated : entry))
        .sort((a, b) => `${a.dayOfWeek}-${a.startTime}-${a.id}`.localeCompare(`${b.dayOfWeek}-${b.startTime}-${b.id}`))
    );
  }, [setRoutines]);

  const deleteRoutine = useCallback(async (id: number) => {
    await RoutineApi.delete(id);
    setRoutines((prev) => prev.filter((entry) => entry.id !== id));
  }, [setRoutines]);

  return {
    createTeacher, updateTeacher, deleteTeacher,
    createStudent, updateStudent, deleteStudent,
    createClass, updateClass, deleteClass,
    createRoutine, updateRoutine, deleteRoutine,
  };
}
