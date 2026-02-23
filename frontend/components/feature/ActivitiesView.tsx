'use client';

import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { User, Activity, MoodType } from '../../modules/shared/types';
import { MOCK_STUDENTS } from '../../modules/shared/data/mockData';

interface ActivitiesViewProps {
  user: User;
  activities: Activity[];
  onAddActivity: (studentId: string, text: string, mood: MoodType) => void;
}

export function ActivitiesView({ user, activities, onAddActivity }: ActivitiesViewProps) {
  if (user.role === 'teacher') {
    return <TeacherActivityPost onAdd={onAddActivity} />;
  }
  return <ParentActivityFeed user={user} activities={activities} />;
}

// ─── Teacher: Post Activity ───────────────────────────────────────────────────
interface TeacherActivityPostProps {
  onAdd: (studentId: string, text: string, mood: MoodType) => void;
}

function TeacherActivityPost({ onAdd }: TeacherActivityPostProps) {
  const [selectedStudent, setSelectedStudent] = useState(MOCK_STUDENTS[0].id);
  const [activityText, setActivityText] = useState('');
  const [mood, setMood] = useState<MoodType>('happy');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityText) return;
    onAdd(selectedStudent, activityText, mood);
    setActivityText('');
    alert('Update posted!');
  };

  const moods: MoodType[] = ['happy', 'neutral', 'sad', 'energetic'];

  return (
    <div className="max-w-xl mx-auto">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">Daily Activity Update</h2>
        <form onSubmit={handlePost} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              {MOCK_STUDENTS.map((s) => (
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
                      : 'border-gray-200'
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
    </div>
  );
}

// ─── Parent: Activity Feed ────────────────────────────────────────────────────
interface ParentActivityFeedProps {
  user: User;
  activities: Activity[];
}

function ParentActivityFeed({ user, activities }: ParentActivityFeedProps) {
  const student = MOCK_STUDENTS.find((s) => s.id === user.studentId);
  if (!student) return null;

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
        {myActivities.map((act) => (
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
        ))}
      </div>
    </div>
  );
}
