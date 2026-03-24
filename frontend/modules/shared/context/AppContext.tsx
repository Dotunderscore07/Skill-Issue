'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
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
import {
  AnnouncementApi,
  ActivityApi,
  AttendanceApi,
  MessageApi,
  AuthApi,
  StudentApi,
  ClassApi,
  UserApi,
  TeacherApi,
  DashboardApi,
  RoutineApi,
} from '../../../lib/api-client';

interface CoordinatorSummary {
  totalTeachers: number;
  totalChildren: number;
  totalParents: number;
  announcements: Announcement[];
}

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
  setSelectedChild: (student: Student) => void;
  setSelectedClass: (cls: Class) => void;
  setSelectedDate: (date: string) => void;
  addAnnouncement: (text: string, type: AnnouncementType, author: string, classId?: string) => Promise<void>;
  updateAnnouncement: (id: number, text: string, type: AnnouncementType, classId?: string) => Promise<void>;
  deleteAnnouncement: (id: number) => Promise<void>;
  addActivity: (studentId: string, text: string, mood: MoodType) => Promise<void>;
  editActivity: (id: number, text: string, mood: MoodType) => Promise<void>;
  deleteActivity: (id: number) => Promise<void>;
  updateAttendance: (studentId: string, status: AttendanceStatus, date: string) => Promise<void>;
  sendMessage: (toId: string, text: string, image?: string) => Promise<void>;
  sendBroadcastMessage: (text: string, image?: string) => Promise<void>;
  createTeacher: (payload: TeacherPayload) => Promise<void>;
  updateTeacher: (id: string, payload: UpdateTeacherPayload) => Promise<void>;
  updateUserProfile: (id: string, payload: { name: string; phone: string; password?: string; avatar?: string }) => Promise<void>;
  createStudent: (payload: StudentPayload) => Promise<void>;
  updateStudent: (id: string, payload: StudentPayload) => Promise<void>;
  createClass: (payload: ClassPayload) => Promise<void>;
  updateClass: (id: string, payload: ClassPayload) => Promise<void>;
  createRoutine: (payload: RoutinePayload) => Promise<void>;
  updateRoutine: (id: number, payload: RoutinePayload) => Promise<void>;
  deleteRoutine: (id: number) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<ViewType>('dashboard');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [broadcastMessages, setBroadcastMessages] = useState<Message[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [coordinatorSummary, setCoordinatorSummary] = useState<CoordinatorSummary | null>(null);

  const syncTeacherAssignments = React.useCallback((teacherId: string, classIds: string[]) => {
    setClasses((prev) =>
      prev.map((entry) => {
        const existingTeacherIds = entry.teacherIds ?? [];
        const withoutTeacher = existingTeacherIds.filter((id) => id !== teacherId);
        return {
          ...entry,
          teacherIds: classIds.includes(entry.id) ? [...withoutTeacher, teacherId] : withoutTeacher,
        };
      })
    );

    setUser((prev) => {
      if (!prev || prev.role !== 'teacher' || prev.id !== teacherId) {
        return prev;
      }

      return {
        ...prev,
        classIds,
      };
    });
  }, []);

  const syncTeacherClassIds = React.useCallback((teacherIdsByClass: Record<string, string[]>) => {
    setAllUsers((prev) =>
      prev.map((userEntry) => {
        if (userEntry.role !== 'teacher') {
          return userEntry;
        }

        const classIds = Object.entries(teacherIdsByClass)
          .filter(([, teacherIds]) => teacherIds.includes(userEntry.id))
          .map(([classId]) => classId);

        return {
          ...userEntry,
          classIds,
        };
      })
    );

    setUser((prev) => {
      if (!prev || prev.role !== 'teacher') {
        return prev;
      }

      const classIds = Object.entries(teacherIdsByClass)
        .filter(([, teacherIds]) => teacherIds.includes(prev.id))
        .map(([classId]) => classId);

      return {
        ...prev,
        classIds,
      };
    });
  }, []);

  const hydrateSelections = React.useCallback(
    (nextUser: User | null, nextStudents: Student[], nextClasses: Class[]) => {
      if (nextUser?.role === 'parent') {
        const myChildren = nextStudents.filter((student) => student.parentId === nextUser.id);
        setSelectedChild((current) => current && myChildren.some((student) => student.id === current.id) ? current : myChildren[0] ?? null);
      } else {
        setSelectedChild(null);
      }

      if (nextUser?.role === 'teacher') {
        const preferredClassId = nextUser.classIds?.[0];
        const fallbackClass =
          nextClasses.find((entry) => entry.id === preferredClassId) ??
          nextClasses.find((entry) => entry.teacherIds?.includes(nextUser.id));
        setSelectedClass((current) => current && nextClasses.some((entry) => entry.id === current.id) ? current : fallbackClass ?? nextClasses[0] ?? null);
      } else {
        setSelectedClass(null);
      }
    },
    []
  );

  const loadData = React.useCallback(async (activeUser: User) => {
    const shouldLoadRoutines =
      activeUser.role === 'teacher' || activeUser.role === 'coordinator' || activeUser.role === 'parent';
    const [anns, acts, atts, studs, clss, routinesData, allUsrs, directMessages, broadcasts] = await Promise.all([
      AnnouncementApi.getAll(),
      ActivityApi.getAll(),
      AttendanceApi.getAll(),
      StudentApi.getAll(),
      ClassApi.getAll(),
      shouldLoadRoutines ? RoutineApi.getAll() : Promise.resolve([]),
      UserApi.getAll(),
      MessageApi.getAll(),
      activeUser.role === 'coordinator' ? MessageApi.getBroadcasts() : Promise.resolve([]),
    ]);

    setAnnouncements(anns);
    setActivities(acts);
    setAttendance(atts);
    setStudents(studs);
    setClasses(clss);
    setRoutines(routinesData);
    setAllUsers(allUsrs);
    setMessages(directMessages);
    setBroadcastMessages(broadcasts);
    hydrateSelections(activeUser, studs, clss);

    if (activeUser.role === 'coordinator') {
      const summary = await DashboardApi.getCoordinatorSummary();
      setCoordinatorSummary(summary);
    } else {
      setCoordinatorSummary(null);
    }
  }, [hydrateSelections]);

  React.useEffect(() => {
    AuthApi.me()
      .then((userData) => {
        setUser(userData);
        setToken('cookie');
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  React.useEffect(() => {
    if (!token || !user) {
      setAnnouncements([]);
      setActivities([]);
      setAttendance([]);
      setStudents([]);
      setClasses([]);
      setRoutines([]);
      setAllUsers([]);
      setMessages([]);
      setBroadcastMessages([]);
      setSelectedChild(null);
      setSelectedClass(null);
      setCoordinatorSummary(null);
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);
    loadData(user)
      .catch((err) => console.error('Failed to load initial data:', err))
      .finally(() => setAuthLoading(false));
  }, [token, user, loadData]);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken || 'cookie');
    if (typeof window !== 'undefined') {
      localStorage.setItem('kinderconnect_token', authToken);
    }
    setView('dashboard');
  };

  const logout = async () => {
    try {
      await AuthApi.logout();
    } catch (e) {
      console.error(e);
    }

    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kinderconnect_token');
    }
  };

  const addAnnouncement = async (text: string, type: AnnouncementType, author: string, classId?: string) => {
    const newAnnouncement = await AnnouncementApi.create(text, type, author, classId);
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    setCoordinatorSummary((prev) =>
      prev
        ? {
            ...prev,
            announcements: [newAnnouncement, ...prev.announcements].slice(0, 5),
          }
        : prev
    );
  };

  const updateAnnouncement = async (id: number, text: string, type: AnnouncementType, classId?: string) => {
    const updated = await AnnouncementApi.update(id, text, type, classId);
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? updated : a)));
    setCoordinatorSummary((prev) =>
      prev
        ? {
            ...prev,
            announcements: prev.announcements.map((a) => (a.id === id ? updated : a)),
          }
        : prev
    );
  };

  const deleteAnnouncement = async (id: number) => {
    await AnnouncementApi.delete(id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    setCoordinatorSummary((prev) =>
      prev
        ? {
            ...prev,
            announcements: prev.announcements.filter((a) => a.id !== id),
          }
        : prev
    );
  };

  const addActivity = async (studentId: string, text: string, mood: MoodType) => {
    const newActivity = await ActivityApi.create(studentId, text, mood);
    setActivities((prev) => [newActivity, ...prev]);
  };

  const editActivity = async (id: number, text: string, mood: MoodType) => {
    const updated = await ActivityApi.update(id, text, mood);
    setActivities((prev) => prev.map((activity) => (activity.id === id ? updated : activity)));
  };

  const deleteActivity = async (id: number) => {
    await ActivityApi.delete(id);
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
  };

  const updateAttendance = async (studentId: string, status: AttendanceStatus, date: string) => {
    const updatedRecord = await AttendanceApi.update(studentId, status, date);
    setAttendance((prev) => {
      const filtered = prev.filter((entry) => !(entry.studentId === studentId && entry.date === date));
      return [...filtered, updatedRecord];
    });
  };

  const sendMessage = async (toId: string, text: string, image?: string) => {
    const newMessage = await MessageApi.send(toId, text, image);
    setMessages((prev) => [...prev, newMessage]);
  };

  const sendBroadcastMessage = async (text: string, image?: string) => {
    const newMessage = await MessageApi.sendBroadcast(text, image);
    setBroadcastMessages((prev) => [newMessage, ...prev]);
  };

  const createTeacher = async (payload: TeacherPayload) => {
    const created = await TeacherApi.create(payload);
    setAllUsers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    syncTeacherAssignments(created.id, created.classIds ?? payload.classIds);
    setCoordinatorSummary((prev) => (prev ? { ...prev, totalTeachers: prev.totalTeachers + 1 } : prev));
  };

  const updateTeacher = async (id: string, payload: UpdateTeacherPayload) => {
    const updated = await TeacherApi.update(id, payload);
    setAllUsers((prev) => prev.map((entry) => (entry.id === id ? updated : entry)));
    syncTeacherAssignments(updated.id, updated.classIds ?? payload.classIds);
  };

  const updateUserProfile = async (id: string, payload: { name: string; phone: string; password?: string; avatar?: string }) => {
    const updated = await UserApi.updateProfile(id, payload);
    setUser(updated);
    if (updated.role === 'teacher' || updated.role === 'coordinator') {
      setAllUsers((prev) => prev.map((entry) => (entry.id === id ? updated : entry)));
    }
  };

  const createStudent = async (payload: StudentPayload) => {
    const created = await StudentApi.create(payload);
    setStudents((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setCoordinatorSummary((prev) => (prev ? { ...prev, totalChildren: prev.totalChildren + 1 } : prev));
  };

  const updateStudent = async (id: string, payload: StudentPayload) => {
    const updated = await StudentApi.update(id, payload);
    setStudents((prev) => prev.map((entry) => (entry.id === id ? updated : entry)));
    setSelectedChild((prev) => (prev?.id === id ? updated : prev));
  };

  const createClass = async (payload: ClassPayload) => {
    const created = await ClassApi.create(payload);
    setClasses((prev) => {
      const nextClasses = [...prev, created].sort((a, b) => a.name.localeCompare(b.name));
      syncTeacherClassIds(Object.fromEntries(nextClasses.map((entry) => [entry.id, entry.teacherIds ?? []])));
      return nextClasses;
    });
  };

  const updateClass = async (id: string, payload: ClassPayload) => {
    const updated = await ClassApi.update(id, payload);
    setClasses((prev) => {
      const nextClasses = prev.map((entry) => (entry.id === id ? updated : entry));
      syncTeacherClassIds(Object.fromEntries(nextClasses.map((entry) => [entry.id, entry.teacherIds ?? []])));
      return nextClasses;
    });
  };

  const deleteTeacher = async (id: string) => {
    await TeacherApi.delete(id);
    setAllUsers((prev) => prev.filter((entry) => entry.id !== id));
    setCoordinatorSummary((prev) => (prev ? { ...prev, totalTeachers: Math.max(0, prev.totalTeachers - 1) } : prev));
  };

  const deleteStudent = async (id: string) => {
    await StudentApi.delete(id);
    setStudents((prev) => prev.filter((entry) => entry.id !== id));
    setCoordinatorSummary((prev) => (prev ? { ...prev, totalChildren: Math.max(0, prev.totalChildren - 1) } : prev));
  };

  const deleteClass = async (id: string) => {
    await ClassApi.delete(id);
    setClasses((prev) => prev.filter((entry) => entry.id !== id));
  };

  const createRoutine = async (payload: RoutinePayload) => {
    const created = await RoutineApi.create(payload);
    setRoutines((prev) =>
      [...prev, created].sort((a, b) =>
        `${a.dayOfWeek}-${a.startTime}-${a.id}`.localeCompare(`${b.dayOfWeek}-${b.startTime}-${b.id}`)
      )
    );
  };

  const updateRoutine = async (id: number, payload: RoutinePayload) => {
    const updated = await RoutineApi.update(id, payload);
    setRoutines((prev) =>
      prev
        .map((entry) => (entry.id === id ? updated : entry))
        .sort((a, b) => `${a.dayOfWeek}-${a.startTime}-${a.id}`.localeCompare(`${b.dayOfWeek}-${b.startTime}-${b.id}`))
    );
  };

  const deleteRoutine = async (id: number) => {
    await RoutineApi.delete(id);
    setRoutines((prev) => prev.filter((entry) => entry.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        authLoading,
        view,
        announcements,
        activities,
        attendance,
        messages,
        broadcastMessages,
        allUsers,
        students,
        classes,
        routines,
        selectedChild,
        selectedClass,
        selectedDate,
        coordinatorSummary,
        login,
        logout,
        setView,
        setSelectedChild,
        setSelectedClass,
        setSelectedDate,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addActivity,
        editActivity,
        deleteActivity,
        updateAttendance,
        sendMessage,
        sendBroadcastMessage,
        createTeacher,
        updateTeacher,
        updateUserProfile,
        createStudent,
        updateStudent,
        createClass,
        updateClass,
        createRoutine,
        updateRoutine,
        deleteRoutine,
        deleteTeacher,
        deleteStudent,
        deleteClass,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return ctx;
}
