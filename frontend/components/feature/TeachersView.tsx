'use client';

import React, { useState } from 'react';
import { PencilLine, Plus } from 'lucide-react';
import { Button, Card } from '../ui';
import { useAppContext } from '../../modules/shared/context/AppContext';
import { useAlert } from '../../modules/shared/context/AlertContext';

export function TeachersView() {
  const { allUsers, classes, createTeacher, updateTeacher, deleteTeacher } = useAppContext();
  const { confirmAction } = useAlert();
  const teachers = allUsers.filter((user) => user.role === 'teacher');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', password: '', classIds: [] as string[], avatar: '' });

  const startCreate = () => {
    setEditingId(null);
    setForm({ name: '', phone: '', password: '', classIds: [], avatar: '' });
  };

  const handlePhotoChange = async (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, avatar: typeof reader.result === 'string' ? reader.result : '' }));
    };
    reader.readAsDataURL(file);
  };

  const startEdit = (teacherId: string) => {
    const teacher = teachers.find((entry) => entry.id === teacherId);
    if (!teacher) return;
    setEditingId(teacher.id);
    setForm({
      name: teacher.name,
      phone: teacher.phone ?? '',
      password: '',
      classIds: teacher.classIds ?? [],
      avatar: teacher.avatar ?? '',
    });
  };

  const toggleClass = (classId: string) => {
    setForm((current) => ({
      ...current,
      classIds: current.classIds.includes(classId)
        ? current.classIds.filter((entry) => entry !== classId)
        : [...current.classIds, classId],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (editingId) {
      await updateTeacher(editingId, form);
    } else {
      await createTeacher(form);
    }
    startCreate();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Teacher' : 'Create Teacher Account'}</h3>
            <p className="text-sm text-gray-500 mt-1">Teachers stay in the existing shared user system and can be assigned to multiple classes.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Teacher Name <span className="text-red-500">*</span></label>
              <input required value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="Enter full name" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
              <input required value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} placeholder="Enter phone number" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password {!editingId && <span className="text-red-500">*</span>}</label>
              <input required={!editingId} value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} placeholder={editingId ? 'Leave blank to keep current' : 'Enter a password'} type="password" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Profile Photo (Optional)</label>
            <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            {(form.avatar && form.avatar.startsWith('data:')) && (
              <img src={form.avatar} alt="Teacher preview" className="w-20 h-20 rounded-2xl object-cover border border-gray-200" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Assigned classes</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {classes.map((entry) => (
                <label key={entry.id} className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
                  <input type="checkbox" checked={form.classIds.includes(entry.id)} onChange={() => toggleClass(entry.id)} />
                  <span className="text-sm text-gray-700">{entry.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            {editingId && (
              <>
                <Button type="button" variant="danger" onClick={async () => {
                  if (await confirmAction('Are you sure you want to delete this teacher? This will delete their class assignments and assigned routines!')) {
                    await deleteTeacher(editingId);
                    startCreate();
                  }
                }}>
                  Delete Teacher
                </Button>
                <Button type="button" variant="secondary" onClick={startCreate}>
                  Go Back
                </Button>
              </>
            )}
            <Button type="submit">
              {editingId ? 'Save Teacher' : 'Create Teacher'}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg">Teachers</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold shrink-0">
                  {teacher.avatar?.startsWith('data:') ? <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" /> : teacher.avatar || teacher.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{teacher.name}</p>
                  <p className="text-sm text-gray-500">{teacher.phone}</p>
                  <p className="text-xs text-gray-400 mt-1">
                  {(teacher.classIds ?? [])
                    .map((classId) => classes.find((entry) => entry.id === classId)?.name ?? classId)
                    .join(', ') || 'No classes assigned'}
                  </p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => startEdit(teacher.id)}>
                <PencilLine size={16} />
                Edit
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
