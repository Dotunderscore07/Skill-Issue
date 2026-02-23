import {
  Announcement,
  Activity,
  AttendanceRecord,
  Message,
  AnnouncementType,
  AttendanceStatus,
  MoodType,
} from '../modules/shared/types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = (await res.json()) as { success: boolean; data: T; error?: string };
  if (!json.success) throw new Error(json.error ?? 'API error');
  return json.data;
}

// ─── Announcements ────────────────────────────────────────────────────────────
export class AnnouncementApi {
  static getAll() {
    return request<Announcement[]>(`${BASE}/announcements`);
  }

  static create(text: string, type: AnnouncementType, author: string) {
    return request<Announcement>(`${BASE}/announcements`, {
      method: 'POST',
      body: JSON.stringify({ text, type, author }),
    });
  }
}

// ─── Activities ───────────────────────────────────────────────────────────────
export class ActivityApi {
  static getAll(studentId?: string) {
    const qs = studentId ? `?studentId=${studentId}` : '';
    return request<Activity[]>(`${BASE}/activities${qs}`);
  }

  static create(studentId: string, text: string, mood: MoodType) {
    return request<Activity>(`${BASE}/activities`, {
      method: 'POST',
      body: JSON.stringify({ studentId, text, mood }),
    });
  }
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export class AttendanceApi {
  static getAll(studentId?: string, date?: string) {
    const params = new URLSearchParams();
    if (studentId) params.set('studentId', studentId);
    if (date) params.set('date', date);
    return request<AttendanceRecord[]>(`${BASE}/attendance?${params.toString()}`);
  }

  static update(studentId: string, status: AttendanceStatus, date: string) {
    return request<AttendanceRecord>(`${BASE}/attendance`, {
      method: 'PUT',
      body: JSON.stringify({ studentId, status, date }),
    });
  }
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export class MessageApi {
  static getThread(userId: string, partnerId: string) {
    return request<Message[]>(`${BASE}/messages?userId=${userId}&partnerId=${partnerId}`);
  }

  static send(fromId: string, toId: string, text: string) {
    return request<Message>(`${BASE}/messages`, {
      method: 'POST',
      body: JSON.stringify({ fromId, toId, text }),
    });
  }
}
