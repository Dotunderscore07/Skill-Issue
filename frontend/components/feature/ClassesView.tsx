'use client';

import React, { useState } from 'react';
import { PencilLine, Plus } from 'lucide-react';
import { Button, Card } from '../ui';
import { Class } from '../../modules/shared/types';
import { useAppContext } from '../../modules/shared/context/AppContext';
import { useAlert } from '../../modules/shared/context/AlertContext';

export function ClassesView() {
  const { classes, allUsers, createClass, updateClass, deleteClass } = useAppContext();
  const { confirmAction } = useAlert();
  const teachers = allUsers.filter((user) => user.role === 'teacher');
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [form, setForm] = useState({ name: '', teacherIds: [] as string[] });

  const resetForm = () => {
    setEditingClass(null);
    setForm({ name: '', teacherIds: [] });
  };

  const startEdit = (entry: Class) => {
    setEditingClass(entry);
    setForm({ name: entry.name, teacherIds: entry.teacherIds ?? [] });
  };

  const toggleTeacher = (teacherId: string) => {
    setForm((current) => ({
      ...current,
      teacherIds: current.teacherIds.includes(teacherId)
        ? current.teacherIds.filter((entry) => entry !== teacherId)
        : [...current.teacherIds, teacherId],
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (editingClass) {
      await updateClass(editingClass.id, form);
    } else {
      await createClass(form);
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{editingClass ? 'Edit Class' : 'Create Class'}</h3>
            <p className="text-sm text-gray-500 mt-1">Classes stay linked to teachers through the existing join-table pattern.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Class Name <span className="text-red-500">*</span></label>
            <input required value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="Enter a descriptive class name (e.g. Toddlers, Pre-K)" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Assigned Teachers</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {teachers.map((teacher) => (
                <label key={teacher.id} className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input type="checkbox" checked={form.teacherIds.includes(teacher.id)} onChange={() => toggleTeacher(teacher.id)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  <span className="text-sm text-gray-700">{teacher.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            {editingClass && (
              <>
                <Button
                  type="button"
                  variant="danger"
                  onClick={async () => {
                    if (await confirmAction('Are you sure you want to delete this class? This will delete all routines, assigned teachers, and unassign enrolled children!')) {
                      await deleteClass(editingClass.id);
                      resetForm();
                    }
                  }}
                >
                  Delete Class
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Go Back
                </Button>
              </>
            )}
            <Button type="submit">
              {editingClass ? 'Save Class' : 'Create Class'}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg">Classes</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {classes.map((entry) => (
            <div key={entry.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{entry.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {(entry.teacherIds ?? [])
                    .map((teacherId) => teachers.find((teacher) => teacher.id === teacherId)?.name ?? teacherId)
                    .join(', ') || 'No teachers assigned'}
                </p>
              </div>
              <Button variant="secondary" onClick={() => startEdit(entry)}>
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
