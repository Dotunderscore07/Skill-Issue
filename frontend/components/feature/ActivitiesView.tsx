'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Trash, Edit } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { User, Activity, MoodType } from '../../modules/shared/types';
import { useAppContext } from '../../modules/shared/context/AppContext';

interface ActivitiesViewProps {
  user: User;
  activities: Activity[];
  onAddActivity: (studentId: string, text: string, mood: MoodType) => void;
  onEditActivity: (id: number, text: string, mood: MoodType) => void;
  onDeleteActivity: (id: number) => void;
}

export function ActivitiesView({
  user,
  activities,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}: ActivitiesViewProps) {
  const { students, selectedChild, selectedClass, authLoading: loading } = useAppContext();

  if (loading) return <div className="p-8 text-center text-gray-500">Loading activities...</div>;

  if (user.role === 'teacher') {
    const classStudents = students.filter(s => s.classId === selectedClass?.id);
    return (
      <TeacherActivityFeed
        students={classStudents}
        activities={activities}
        selectedClassName={selectedClass?.name || ''}
        onAdd={onAddActivity}
        onEdit={onEditActivity}
        onDelete={onDeleteActivity}
      />
    );
  }
  return <ParentActivityFeed user={user} student={selectedChild} activities={activities} />;
}

// ─── Teacher: Post & Edit Activity ────────────────────────────────────────────────
interface TeacherActivityFeedProps {
  students: any[];
  activities: Activity[];
  selectedClassName: string;
  onAdd: (studentId: string, text: string, mood: MoodType) => void;
  onEdit: (id: number, text: string, mood: MoodType) => void;
  onDelete: (id: number) => void;
}

function TeacherActivityFeed({ students, activities, selectedClassName, onAdd, onEdit, onDelete }: TeacherActivityFeedProps) {
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    if (students.length > 0 && !students.some(s => s.id === selectedStudent)) {
      setSelectedStudent(students[0].id);
    }
  }, [students, selectedStudent]);

  const [activityText, setActivityText] = useState('');
  const [mood, setMood] = useState<MoodType>('happy');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [editMood, setEditMood] = useState<MoodType>('happy');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityText || !selectedStudent) return;
    onAdd(selectedStudent, activityText, mood);
    setActivityText('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && editBuffer) {
      onEdit(editingId, editBuffer, editMood);
      setEditingId(null);
    }
  };

  const moods: MoodType[] = ['happy', 'neutral', 'sad', 'energetic'];

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Daily Activity Update</h2>
          {selectedClassName && <Badge color="indigo">{selectedClassName}</Badge>}
        </div>
        <form onSubmit={handlePost} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Description
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="E.g., Ate all their lunch, played with blocks..."
              value={activityText}
              onChange={(e) => setActivityText(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
            <div className="flex gap-4">
              {moods.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`px-3 py-1 rounded-full text-sm capitalize border ${
                    mood === m
                      ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                      : 'border-gray-200 hover:bg-gray-50 cursor-pointer text-gray-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full mt-4">
            Share with Parent
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 text-lg">Manage Recent Activities</h3>
        {activities.map((act) => {
          const studentName = students.find((s) => s.id === act.studentId)?.name || 'Unknown';
          
          if (editingId === act.id) {
            return (
              <Card key={act.id} className="p-4 border-l-4 border-l-indigo-500">
                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-sm text-gray-600">Editing for: {studentName}</span>
                  </div>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    rows={2}
                    value={editBuffer}
                    onChange={(e) => setEditBuffer(e.target.value)}
                  />
                  <div className="flex gap-2">
                    {moods.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setEditMood(m)}
                        className={`px-2 py-1 rounded text-xs capitalize ${
                          editMood === m ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1 text-sm bg-gray-100 rounded text-gray-600">Cancel</button>
                    <button type="submit" className="px-3 py-1 text-sm bg-indigo-600 rounded text-white font-medium">Save</button>
                  </div>
                </form>
              </Card>
            );
          }

          return (
            <Card key={act.id} className="p-4 flex gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-900">{studentName}</span>
                  <span className="text-xs text-gray-400">{act.date}</span>
                </div>
                <div className="mb-2">
                  <Badge color="blue">{act.mood}</Badge>
                </div>
                <p className="text-sm text-gray-700">{act.text}</p>
              </div>
              <div className="flex flex-col gap-2 justify-start border-l border-gray-100 pl-4">
                <button
                  onClick={() => {
                    setEditingId(act.id);
                    setEditBuffer(act.text);
                    setEditMood(act.mood);
                  }}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this activity?')) onDelete(act.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash size={16} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Parent: Activity Feed ────────────────────────────────────────────────────
interface ParentActivityFeedProps {
  user: User;
  student: any;
  activities: Activity[];
}

function ParentActivityFeed({ user, student, activities }: ParentActivityFeedProps) {
  
  if (!student) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Hang tight!</h2>
        <p>Your account is not linked to a student yet. Activities will appear here once assigned.</p>
      </div>
    );
  }

  const myActivities = activities
    .filter((a) => a.studentId === student.id)
    .sort((a, b) => b.id - a.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
          <BookOpen />
        </div>
        <h2 className="text-2xl font-bold">Activity Log: {student.name}</h2>
      </div>

      <div className="relative pl-8 border-l-2 border-indigo-100 space-y-8">
        {myActivities.length > 0 ? (
          myActivities.map((act) => (
            <div key={act.id} className="relative">
              <div className="absolute -left-[39px] top-0 w-5 h-5 rounded-full bg-indigo-500 border-4 border-white shadow-sm" />
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    {act.date}
                  </span>
                  <Badge color="blue">{act.mood}</Badge>
                </div>
                <p className="text-gray-800">{act.text}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 italic relative">
             <div className="absolute -left-[39px] top-0 w-5 h-5 rounded-full bg-gray-300 border-4 border-white shadow-sm" />
             No activities posted yet.
          </div>
        )}
      </div>
    </div>
  );
}
