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
  view: ViewType;
  announcements: Announcement[];
  activities: Activity[];
  attendance: AttendanceRecord[];
  messages: Message[];
  login: (userId: string) => void;
  logout: () => void;
  setView: (view: ViewType) => void;
  addAnnouncement: (text: string, type: AnnouncementType, author: string) => void;
  addActivity: (studentId: string, text: string, mood: MoodType) => void;
  updateAttendance: (studentId: string, status: AttendanceStatus, date: string) => void;
  sendMessage: (fromId: string, toId: string, text: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewType>('dashboard');
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  const login = (userId: string) => {
    const found = MOCK_USERS.find((u) => u.id === userId);
    if (found) {
      setUser(found);
      setView('dashboard');
    }
  };

  const logout = () => setUser(null);

  const addAnnouncement = (text: string, type: AnnouncementType, author: string) => {
    const newAnn: Announcement = {
      id: Date.now(),
      text,
      type,
      date: new Date().toISOString().split('T')[0],
      author,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const addActivity = (studentId: string, text: string, mood: MoodType) => {
    const newActivity: Activity = {
      id: Date.now(),
      studentId,
      text,
      date: new Date().toISOString().split('T')[0],
      mood,
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const updateAttendance = (studentId: string, status: AttendanceStatus, date: string) => {
    setAttendance((prev) => {
      const filtered = prev.filter((a) => !(a.studentId === studentId && a.date === date));
      return [...filtered, { date, studentId, status }];
    });
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
