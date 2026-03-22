'use client';

import React, { useState } from 'react';
import { PencilLine, Plus } from 'lucide-react';
import { Button, Card } from '../ui';
import { Student } from '../../modules/shared/types';
import { useAppContext } from '../../modules/shared/context/AppContext';

const emptyForm = {
  name: '',
  dob: '',
  photo: '',
  parentId: '',
  classId: '',
};

export function ChildrenView() {
  const { students, classes, allUsers, createStudent, updateStudent, deleteStudent } = useAppContext();
  const parents = allUsers.filter((user) => user.role === 'parent');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setEditingStudent(null);
    setForm(emptyForm);
  };

  const handlePhotoChange = async (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, photo: typeof reader.result === 'string' ? reader.result : '' }));
    };
    reader.readAsDataURL(file);
  };

  const startEdit = (student: Student) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      dob: student.dob,
      photo: student.photo,
      parentId: student.parentId ?? '',
      classId: student.classId,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.classId) {
      return;
    }

    const payload = {
      ...form,
      parentId: form.parentId || undefined,
    };

    if (editingStudent) {
      await updateStudent(editingStudent.id, payload);
    } else {
      await createStudent(payload);
    }

    resetForm();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{editingStudent ? 'Edit Child Profile' : 'Create Child Profile'}</h3>
            <p className="text-sm text-gray-500 mt-1">Assign each child to an existing parent account and class.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Child Name <span className="text-red-500">*</span></label>
              <input required value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="Enter child's full name" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
              <input required value={form.dob} onChange={(e) => setForm((current) => ({ ...current, dob: e.target.value }))} type="date" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Parent (Optional)</label>
              <select value={form.parentId} onChange={(e) => setForm((current) => ({ ...current, parentId: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                <option value="">Select a parent</option>
                {parents.map((parent) => (
                  <option key={parent.id} value={parent.id}>{parent.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Class <span className="text-red-500">*</span></label>
              <select required value={form.classId} onChange={(e) => setForm((current) => ({ ...current, classId: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                <option value="">Select a class</option>
                {classes.map((entry) => (
                  <option key={entry.id} value={entry.id}>{entry.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Profile Photo</label>
            <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            {form.photo && (
              <img src={form.photo} alt="Child preview" className="w-20 h-20 rounded-2xl object-cover border border-gray-200" />
            )}
          </div>
          <div className="flex justify-end gap-3 mt-4">
            {editingStudent && (
              <>
                <Button type="button" variant="danger" onClick={async () => {
                  if (confirm('Are you sure you want to delete this child? This will also remove their activities and attendance records!')) {
                    await deleteStudent(editingStudent.id);
                    resetForm();
                  }
                }}>
                  Delete Child
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Go Back
                </Button>
              </>
            )}
            <Button type="submit" disabled={!form.name || !form.dob || !form.classId}>
              {editingStudent ? 'Save Child' : 'Create Child'}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg">Children</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {students.map((student) => (
            <div key={student.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                  {student.photo ? <img src={student.photo} alt={student.name} className="w-full h-full object-cover" /> : student.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-500">DOB: {student.dob}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {parents.find((parent) => parent.id === student.parentId)?.name ?? 'No parent assigned'} | {classes.find((entry) => entry.id === student.classId)?.name ?? 'No class'}
                  </p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => startEdit(student)}>
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
