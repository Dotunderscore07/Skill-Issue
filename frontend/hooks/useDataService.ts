import { useState, useCallback, useMemo } from 'react';
import {
  Announcement,
  Activity,
  AttendanceRecord,
  Message,
  Student,
  Class,
  Routine,
  User,
  AnnouncementType,
  MoodType,
  AttendanceStatus,
  DayOfWeek
} from '../modules/shared/types';
import {
  AnnouncementApi,
  ActivityApi,
  AttendanceApi,
  MessageApi,
  StudentApi,
  ClassApi,
  UserApi,
  TeacherApi,
  DashboardApi,
  RoutineApi
} from '../lib/api-client';

export function useDataService() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [coordinatorSummary, setCoordinatorSummary] = useState<any | null>(null);

  const loadAllData = useCallback(async (activeUser: User) => {
    const shouldLoadRoutines = ['teacher', 'coordinator', 'parent', 'admin'].includes(activeUser.role);
    
    const [anns, acts, atts, studs, clss, routinesData, allUsrs, directMessages] = await Promise.all([
      AnnouncementApi.getAll(),
      ActivityApi.getAll(),
      AttendanceApi.getAll(),
      StudentApi.getAll(),
      ClassApi.getAll(),
      shouldLoadRoutines ? RoutineApi.getAll() : Promise.resolve([]),
      UserApi.getAll(),
      MessageApi.getAll(),
    ]);

    setAnnouncements(anns);
    setActivities(acts);
    setAttendance(atts);
    setStudents(studs);
    setClasses(clss);
    setRoutines(routinesData);
    setAllUsers(allUsrs);
    setMessages(directMessages);

    if (activeUser.role === 'coordinator') {
      const summary = await DashboardApi.getCoordinatorSummary();
      setCoordinatorSummary(summary);
    } else {
      setCoordinatorSummary(null);
    }

    return {
      announcements: anns,
      activities: acts,
      attendance: atts,
      students: studs,
      classes: clss,
      routines: routinesData,
      allUsers: allUsrs,
      messages: directMessages,
    };
  }, []);

  const addAnnouncement = useCallback(async (text: string, type: AnnouncementType, author: string, classId?: string) => {
    const newAnnouncement = await AnnouncementApi.create(text, type, author, classId);
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    setCoordinatorSummary((prev: any) =>
      prev ? { 
        ...prev, 
        announcements: [newAnnouncement, ...(prev.announcements || [])].slice(0, 10) 
      } : prev
    );
  }, []);

  const updateAnnouncement = useCallback(async (id: number, text: string, type: AnnouncementType, classId?: string) => {
    const updated = await AnnouncementApi.update(id, text, type, classId);
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? updated : a)));
    setCoordinatorSummary((prev: any) =>
      prev ? { 
        ...prev, 
        announcements: (prev.announcements || []).map((a: any) => (a.id === id ? updated : a)) 
      } : prev
    );
  }, []);

  const deleteAnnouncement = useCallback(async (id: number) => {
    await AnnouncementApi.delete(id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    setCoordinatorSummary((prev: any) =>
      prev ? { 
        ...prev, 
        announcements: (prev.announcements || []).filter((a: any) => (a.id !== id)) 
      } : prev
    );
  }, []);

  // Activities
  const addActivity = useCallback(async (studentId: string, text: string, mood: MoodType) => {
    const newActivity = await ActivityApi.create(studentId, text, mood);
    setActivities((prev) => [newActivity, ...prev]);
  }, []);

  const editActivity = useCallback(async (id: number, text: string, mood: MoodType) => {
    const updated = await ActivityApi.update(id, text, mood);
    setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }, []);

  const deleteActivity = useCallback(async (id: number) => {
    await ActivityApi.delete(id);
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Attendance
  const updateAttendance = useCallback(async (studentId: string, status: AttendanceStatus, date: string) => {
    const updatedRecord = await AttendanceApi.update(studentId, status, date);
    setAttendance((prev) => {
      const filtered = prev.filter((entry) => !(entry.studentId === studentId && entry.date === date));
      return [...filtered, updatedRecord];
    });
  }, []);

  // Messages
  const sendMessage = useCallback(async (toId: string, text: string, image?: string) => {
    const newMessage = await MessageApi.send(toId, text, image);
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  // CRUD Helpers
  const clearAllData = useCallback(() => {
    setAnnouncements([]);
    setActivities([]);
    setAttendance([]);
    setStudents([]);
    setClasses([]);
    setRoutines([]);
    setAllUsers([]);
    setMessages([]);
    setCoordinatorSummary(null);
  }, []);

  return {
    announcements, setAnnouncements,
    activities, setActivities,
    attendance, setAttendance,
    messages, setMessages,
    allUsers, setAllUsers,
    students, setStudents,
    classes, setClasses,
    routines, setRoutines,
    coordinatorSummary, setCoordinatorSummary,
    loadAllData,
    clearAllData,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addActivity,
    editActivity,
    deleteActivity,
    updateAttendance,
    sendMessage,
  };
}
