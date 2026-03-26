import {
  Announcement,
  Activity,
  AttendanceRecord,
  Class,
  Message,
  MessageKind,
  Routine,
  Student,
  User,
  AnnouncementType,
  AttendanceStatus,
  DayOfWeek,
  MoodType,
} from '../modules/shared/types';

const BASE = 'http://localhost:4000/api';

async function request<T>(url: string, options?: RequestInit, silent: boolean = false): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('kinderconnect_token');
    if (token) {
      headers['x-auth-token'] = token;
    }
  }

  const res = await fetch(url, {
    headers: { ...headers, ...options?.headers },
    ...options,
    credentials: 'include',
  });

  const json = (await res.json()) as { success: boolean; data: T; error?: string };
  if (!json.success) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-error', { detail: json.error ?? 'API error' }));
    }
    throw new Error(json.error ?? 'API error');
  }

  if (options?.method && options.method !== 'GET' && !silent) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-success', { detail: 'Operation successful' }));
    }
  }

  return json.data;
}

export class AuthApi {
  static me() {
    return request<User>(`${BASE}/auth/me`);
  }

  static logout() {
    return request<null>(`${BASE}/auth/logout`, { method: 'POST' });
  }
}

export class DashboardApi {
  static getCoordinatorSummary() {
    return request<{
      totalTeachers: number;
      totalChildren: number;
      totalParents: number;
      announcements: Announcement[];
    }>(`${BASE}/dashboard/coordinator`);
  }
}

export class AnnouncementApi {
  static getAll() {
    return request<Announcement[]>(`${BASE}/announcements`);
  }

  static create(text: string, type: AnnouncementType, author: string, classId?: string) {
    return request<Announcement>(`${BASE}/announcements`, {
      method: 'POST',
      body: JSON.stringify({ text, type, author, classId: classId ?? null }),
    });
  }

  static update(id: number, text: string, type: AnnouncementType, classId?: string) {
    return request<Announcement>(`${BASE}/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ text, type, classId: classId ?? null }),
    });
  }

  static delete(id: number) {
    return request<{ deleted: boolean; id: number }>(`${BASE}/announcements/${id}`, {
      method: 'DELETE',
    });
  }
}

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

  static update(id: number, text: string, mood: MoodType) {
    return request<Activity>(`${BASE}/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ text, mood }),
    });
  }

  static delete(id: number) {
    return request<{ deleted: boolean }>(`${BASE}/activities/${id}`, {
      method: 'DELETE',
    });
  }
}

export class AttendanceApi {
  static getAll(studentId?: string, date?: string) {
    const params = new URLSearchParams();
    if (studentId) params.set('studentId', studentId);
    if (date) params.set('date', date);
    const queryString = params.toString();
    return request<AttendanceRecord[]>(`${BASE}/attendance${queryString ? `?${queryString}` : ''}`);
  }

  static update(studentId: string, status: AttendanceStatus, date: string) {
    return request<AttendanceRecord>(`${BASE}/attendance`, {
      method: 'PUT',
      body: JSON.stringify({ studentId, status, date }),
    }, true);
  }
}

export class MessageApi {
  static getAll(partnerId?: string) {
    const params = new URLSearchParams();
    if (partnerId) params.set('partnerId', partnerId);
    const queryString = params.toString();
    return request<Message[]>(`${BASE}/messages${queryString ? `?${queryString}` : ''}`);
  }

  static getBroadcasts() {
    return request<Message[]>(`${BASE}/messages?kind=broadcast`);
  }

  static send(toId: string, text: string, image?: string) {
    return request<Message>(`${BASE}/messages`, {
      method: 'POST',
      body: JSON.stringify({ toId, text, image: image ?? '', kind: 'direct' satisfies MessageKind }),
    });
  }

  static sendBroadcast(text: string, image?: string, toId?: string) {
    return request<Message>(`${BASE}/messages`, {
      method: 'POST',
      body: JSON.stringify({ toId: toId ?? null, text, image: image ?? '', kind: 'broadcast' satisfies MessageKind }),
    });
  }
}

export class StudentApi {
  static getAll() {
    return request<Student[]>(`${BASE}/students`);
  }

  static create(payload: { name: string; dob: string; photo: string; parentId?: string; classId: string }) {
    return request<Student>(`${BASE}/students`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static update(studentId: string, payload: { name: string; dob: string; photo: string; parentId?: string; classId: string }) {
    return request<Student>(`${BASE}/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static linkParent(studentId: string, parentId: string) {
    return request<{ studentId: string; parentId: string }>(`${BASE}/students/${studentId}/link`, {
      method: 'PUT',
      body: JSON.stringify({ parentId }),
    });
  }

  static delete(studentId: string) {
    return request<{ deleted: boolean; id: string }>(`${BASE}/students/${studentId}`, {
      method: 'DELETE',
    });
  }
}

export class UserApi {
  static getAll(role?: string) {
    const queryString = role ? `?role=${role}` : '';
    return request<User[]>(`${BASE}/users${queryString}`);
  }

  static updateProfile(id: string, payload: { name: string; phone: string; password?: string; avatar?: string }) {
    return request<User>(`${BASE}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
}

export class TeacherApi {
  static create(payload: { name: string; phone: string; password: string; classIds: string[]; avatar?: string }) {
    return request<User>(`${BASE}/users/teachers`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static update(id: string, payload: { name: string; phone: string; password?: string; classIds: string[]; avatar?: string }) {
    return request<User>(`${BASE}/users/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static delete(id: string) {
    return request<{ deleted: boolean; id: string }>(`${BASE}/users/teachers/${id}`, {
      method: 'DELETE',
    });
  }
}

export class ClassApi {
  static getAll() {
    return request<Class[]>(`${BASE}/classes`);
  }

  static create(payload: { name: string; teacherIds: string[] }) {
    return request<Class>(`${BASE}/classes`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static update(id: string, payload: { name: string; teacherIds: string[] }) {
    return request<Class>(`${BASE}/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static delete(id: string) {
    return request<{ deleted: boolean; id: string }>(`${BASE}/classes/${id}`, {
      method: 'DELETE',
    });
  }
}

export class RoutineApi {
  static getAll(filters?: { classId?: string; teacherId?: string; dayOfWeek?: DayOfWeek }) {
    const params = new URLSearchParams();
    if (filters?.classId) params.set('classId', filters.classId);
    if (filters?.teacherId) params.set('teacherId', filters.teacherId);
    if (filters?.dayOfWeek) params.set('dayOfWeek', filters.dayOfWeek);
    const queryString = params.toString();
    return request<Routine[]>(`${BASE}/routines${queryString ? `?${queryString}` : ''}`);
  }

  static create(payload: { classId: string; teacherId: string; dayOfWeek: DayOfWeek; startTime: string; endTime: string; title: string }) {
    return request<Routine>(`${BASE}/routines`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static update(id: number, payload: { classId: string; teacherId: string; dayOfWeek: DayOfWeek; startTime: string; endTime: string; title: string }) {
    return request<Routine>(`${BASE}/routines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static delete(id: number) {
    return request<{ deleted: boolean; id: number }>(`${BASE}/routines/${id}`, {
      method: 'DELETE',
    });
  }
}
