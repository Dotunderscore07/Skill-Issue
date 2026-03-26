'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  User,
  Announcement,
  Activity,
  AttendanceRecord,
  Message,
  AttendanceStatus,
  AnnouncementType,
  MoodType,
  ViewType,
  Student,
  Class,
  Routine,
  DayOfWeek,
} from '../types';
import { useAuth } from '../../../hooks/useAuth';
import { useDataService } from '../../../hooks/useDataService';
import { useCrudService } from '../../../hooks/useCrudService';

interface CoordinatorSummary {
  totalTeachers: number;
  totalChildren: number;
  totalParents: number;
  announcements: Announcement[];
}

interface AppContextValue {
  user: User | null;
  token: string | null;
  authLoading: boolean;
  view: ViewType;
  announcements: Announcement[];
  activities: Activity[];
  attendance: AttendanceRecord[];
  messages: Message[];
  broadcastMessages: Message[];
  allUsers: User[];
  students: Student[];
  classes: Class[];
  routines: Routine[];
  selectedChild: Student | null;
  selectedClass: Class | null;
  selectedDate: string;
  coordinatorSummary: CoordinatorSummary | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setView: (view: ViewType) => void;
  setSelectedChild: (student: Student | null) => void;
  setSelectedClass: (cls: Class | null) => void;
  setSelectedDate: (date: string) => void;
  addAnnouncement: (text: string, type: AnnouncementType, author: string, classId?: string) => Promise<void>;
  updateAnnouncement: (id: number, text: string, type: AnnouncementType, classId?: string) => Promise<void>;
  deleteAnnouncement: (id: number) => Promise<void>;
  addActivity: (studentId: string, text: string, mood: MoodType) => Promise<void>;
  editActivity: (id: number, text: string, mood: MoodType) => Promise<void>;
  deleteActivity: (id: number) => Promise<void>;
  updateAttendance: (studentId: string, status: AttendanceStatus, date: string) => Promise<void>;
  sendMessage: (toId: string, text: string, image?: string) => Promise<void>;
  sendBroadcastMessage: (text: string, image?: string, classId?: string) => Promise<void>;
  createTeacher: (payload: any) => Promise<void>;
  updateTeacher: (id: string, payload: any) => Promise<void>;
  updateUserProfile: (id: string, payload: any) => Promise<void>;
  createStudent: (payload: any) => Promise<void>;
  updateStudent: (id: string, payload: any) => Promise<void>;
  createClass: (payload: any) => Promise<void>;
  updateClass: (id: string, payload: any) => Promise<void>;
  createRoutine: (payload: any) => Promise<void>;
  updateRoutine: (id: number, payload: any) => Promise<void>;
  deleteRoutine: (id: number) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, setUser, token, authLoading, setAuthLoading, login, logout, updateUserProfile } = useAuth();
  const dataService = useDataService();
  
  const [view, setView] = useState<ViewType>('dashboard');
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const syncTeacherAssignments = useCallback((teacherId: string, classIds: string[]) => {
    dataService.setClasses((prev) =>
      prev.map((cls) => {
        const ids = cls.teacherIds ?? [];
        const withoutTeacher = ids.filter((id) => id !== teacherId);
        return { ...cls, teacherIds: classIds.includes(cls.id) ? [...withoutTeacher, teacherId] : withoutTeacher };
      })
    );
    setUser((prev) => (prev?.id === teacherId && prev.role === 'teacher' ? { ...prev, classIds } : prev));
  }, [dataService.setClasses, setUser]);

  const syncTeacherClassIds = useCallback((teacherIdsByClass: Record<string, string[]>) => {
    const update = (u: User) => {
      if (u.role !== 'teacher') return u;
      const classIds = Object.entries(teacherIdsByClass)
        .filter(([, ids]) => ids.includes(u.id))
        .map(([id]) => id);
      return { ...u, classIds };
    };
    dataService.setAllUsers((prev) => prev.map(update));
    // @ts-ignore
    setUser((prev) => prev ? update(prev) : prev);
  }, [dataService.setAllUsers, setUser]);

  const crudService = useCrudService(
    dataService.setAllUsers,
    dataService.setStudents,
    dataService.setClasses,
    dataService.setRoutines,
    dataService.setCoordinatorSummary,
    syncTeacherAssignments,
    syncTeacherClassIds
  );

  const hydrateSelections = useCallback((nextUser: User | null, nextStudents: Student[], nextClasses: Class[]) => {
    if (nextUser?.role === 'parent') {
      const myChildren = nextStudents.filter((s) => s.parentId === nextUser.id);
      setSelectedChild((curr) => curr && myChildren.some((s) => s.id === curr.id) ? curr : myChildren[0] ?? null);
    } else {
      setSelectedChild(null);
    }

    if (nextUser?.role === 'teacher') {
      const preferred = nextUser.classIds?.[0];
      const fallback = nextClasses.find((c) => c.id === preferred) ?? nextClasses.find((c) => c.teacherIds?.includes(nextUser.id));
      setSelectedClass((curr) => curr && nextClasses.some((c) => c.id === curr.id) ? curr : fallback ?? nextClasses[0] ?? null);
    } else {
      setSelectedClass(null);
    }
  }, []);

  useEffect(() => {
    if (!token || !user) {
      dataService.clearAllData();
      return;
    }
    setAuthLoading(true);
    dataService.loadAllData(user)
      .then(() => hydrateSelections(user, dataService.students, dataService.classes))
      .catch((err) => console.error('Failed to load initial data:', err))
      .finally(() => setAuthLoading(false));
  }, [token, user, dataService.loadAllData, hydrateSelections, setAuthLoading]);

  // Special update handler to sync local user state
  const handleUpdateUserProfile = async (id: string, payload: any) => {
    const updated = await updateUserProfile(id, payload);
    if (updated.role === 'teacher' || updated.role === 'coordinator') {
      dataService.setAllUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    }
  };

  const handleUpdateStudent = async (id: string, payload: any) => {
    await crudService.updateStudent(id, payload);
    const updated = { ...dataService.students.find(s => s.id === id), ...payload };
    setSelectedChild(prev => prev?.id === id ? updated : prev);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        authLoading,
        view,
        setView,
        selectedChild,
        setSelectedChild,
        selectedClass,
        setSelectedClass,
        selectedDate,
        setSelectedDate,
        // Data from dataService
        announcements: dataService.announcements,
        activities: dataService.activities,
        attendance: dataService.attendance,
        messages: dataService.messages,
        broadcastMessages: dataService.broadcastMessages,
        allUsers: dataService.allUsers,
        students: dataService.students,
        classes: dataService.classes,
        routines: dataService.routines,
        coordinatorSummary: dataService.coordinatorSummary,
        addAnnouncement: dataService.addAnnouncement,
        updateAnnouncement: dataService.updateAnnouncement,
        deleteAnnouncement: dataService.deleteAnnouncement,
        addActivity: dataService.addActivity,
        editActivity: dataService.editActivity,
        deleteActivity: dataService.deleteActivity,
        updateAttendance: dataService.updateAttendance,
        sendMessage: dataService.sendMessage,
        sendBroadcastMessage: dataService.sendBroadcastMessage,
        // Data from crudService
        createTeacher: crudService.createTeacher,
        updateTeacher: crudService.updateTeacher,
        deleteTeacher: crudService.deleteTeacher,
        createStudent: crudService.createStudent,
        deleteStudent: crudService.deleteStudent,
        createClass: crudService.createClass,
        updateClass: crudService.updateClass,
        deleteClass: crudService.deleteClass,
        createRoutine: crudService.createRoutine,
        updateRoutine: crudService.updateRoutine,
        deleteRoutine: crudService.deleteRoutine,
        // Overridden/Auth methods
        login,
        logout,
        updateUserProfile: handleUpdateUserProfile,
        updateStudent: handleUpdateStudent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
