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
} from '../types';
import {
  MOCK_USERS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ACTIVITIES,
  INITIAL_ATTENDANCE,
  INITIAL_MESSAGES,
} from '../data/mockData';

interface AppContextValue {
  user: User | null;
  token: string | null;
  authLoading: boolean;
  view: ViewType;
  announcements: Announcement[];
  activities: Activity[];
  attendance: AttendanceRecord[];
  messages: Message[];
  login: (userData: User, token: string) => void;
  logout: () => void;
  setView: (view: ViewType) => void;
  addAnnouncement: (text: string, type: AnnouncementType, author: string) => void;
  addActivity: (studentId: string, text: string, mood: MoodType) => void;
  editActivity: (id: number, text: string, mood: MoodType) => void;
  deleteActivity: (id: number) => void;
  updateAttendance: (studentId: string, status: AttendanceStatus, date: string) => void;
  sendMessage: (fromId: string, toId: string, text: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

import { AnnouncementApi, ActivityApi, AttendanceApi, MessageApi, AuthApi } from '../../../lib/api-client';

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<ViewType>('dashboard');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Hydrate session on mount
  React.useEffect(() => {
    AuthApi.me()
      .then((userData) => {
        setUser(userData);
        setToken('cookie'); // Trigger data fetch
      })
      .catch(() => {
        console.log('No active session.');
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  // Fetch real data when user logs in with a valid token
  React.useEffect(() => {
    if (token) {
      Promise.all([
        AnnouncementApi.getAll(),
        ActivityApi.getAll(),
        AttendanceApi.getAll(),
      ]).then(([anns, acts, atts]) => {
        setAnnouncements(anns);
        setActivities(acts);
        setAttendance(atts);
      }).catch(err => console.error("Failed to load initial data:", err));
    } else {
      setAnnouncements([]);
      setActivities([]);
      setAttendance([]);
    }
  }, [token]);

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

  const addAnnouncement = async (text: string, type: AnnouncementType, author: string) => {
    try {
      const newAnn = await AnnouncementApi.create(text, type, author);
      setAnnouncements((prev) => [newAnn, ...prev]);
    } catch (err) {
      console.error('Failed to create announcement', err);
      throw err;
    }
  };

  const addActivity = async (studentId: string, text: string, mood: MoodType) => {
    try {
      const newActivity = await ActivityApi.create(studentId, text, mood);
      setActivities((prev) => [newActivity, ...prev]);
    } catch (err) {
      console.error('Failed to create activity', err);
      throw err;
    }
  };

  const editActivity = async (id: number, text: string, mood: MoodType) => {
    try {
      const updated = await ActivityApi.update(id, text, mood);
      setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      console.error('Failed to update activity', err);
      throw err;
    }
  };

  const deleteActivity = async (id: number) => {
    try {
      await ActivityApi.delete(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete activity', err);
      throw err;
    }
  };

  const updateAttendance = async (studentId: string, status: AttendanceStatus, date: string) => {
    try {
      const updatedRecord = await AttendanceApi.update(studentId, status, date);
      setAttendance((prev) => {
        const filtered = prev.filter((a) => !(a.studentId === studentId && a.date === date));
        return [...filtered, updatedRecord];
      });
    } catch (err) {
      console.error('Failed to update attendance', err);
      throw err;
    }
  };

  const sendMessage = (fromId: string, toId: string, text: string) => {
    const msg: Message = {
      id: Date.now(),
      fromId,
      toId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setMessages((prev) => [...prev, msg]);
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
        login,
        logout,
        setView,
        addAnnouncement,
        addActivity,
        editActivity,
        deleteActivity,
        updateAttendance,
        sendMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
