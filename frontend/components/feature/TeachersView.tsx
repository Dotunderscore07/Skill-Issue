'use client';

import React, { useState } from 'react';
import { PencilLine, Plus } from 'lucide-react';
import { Button, Card } from '../ui';
import { useAppContext } from '../../modules/shared/context/AppContext';

export function TeachersView() {
  const { allUsers, classes, createTeacher, updateTeacher } = useAppContext();
  const teachers = allUsers.filter((user) => user.role === 'teacher');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', password: '', classIds: [] as string[] });

  const startCreate = () => {
    setEditingId(null);
    setForm({ name: '', phone: '', password: '', classIds: [] });
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
          {editingId && (
            <Button variant="secondary" onClick={startCreate}>New Teacher</Button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="Teacher name" className="px-4 py-2 border border-gray-200 rounded-xl" />
            <input value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} placeholder="Phone number" className="px-4 py-2 border border-gray-200 rounded-xl" />
            <input value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} placeholder={editingId ? 'New password (optional)' : 'Password'} type="password" className="px-4 py-2 border border-gray-200 rounded-xl" />
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
          <Button type="submit">
            <Plus size={18} />
            {editingId ? 'Save Teacher' : 'Create Teacher'}
          </Button>
        </form>
      </Card>

      <Card>
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg">Teachers</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{teacher.name}</p>
                <p className="text-sm text-gray-500">{teacher.phone}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {(teacher.classIds ?? [])
                    .map((classId) => classes.find((entry) => entry.id === classId)?.name ?? classId)
                    .join(', ') || 'No classes assigned'}
                </p>
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
