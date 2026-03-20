'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '../ui';
import { User, Announcement, AnnouncementType } from '../../modules/shared/types';
import { useAppContext } from '../../modules/shared/context/AppContext';

interface AnnouncementsViewProps {
  user: User;
  announcements: Announcement[];
  onAdd: (text: string, type: AnnouncementType, author: string) => void;
}

export function AnnouncementsView({ user, announcements, onAdd }: AnnouncementsViewProps) {
  const { selectedDate, setSelectedDate } = useAppContext();
  const [text, setText] = useState('');
  const [type, setType] = useState<AnnouncementType>('info');

  const today = new Date().toISOString().split('T')[0];
  const canPost = selectedDate === today;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;
    onAdd(text, type, user.name);
    setText('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {user.role === 'teacher' && canPost && (
        <Card className="p-6">
          <h3 className="font-bold text-gray-900 mb-4">Post New Announcement</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              rows={3}
              placeholder="What's happening in class?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AnnouncementType)}
                className="p-2 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="info">General Info ℹ️</option>
                <option value="urgent">Urgent 🚨</option>
                <option value="event">Event 🎉</option>
              </select>
              <Button type="submit">Post to Class</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-gray-900">Notice Board</h3>
          <input 
            type="date"
            className="p-1.5 border rounded-lg bg-white text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        {announcements.filter(a => a.date === selectedDate).length > 0 ? (
          announcements.filter(a => a.date === selectedDate).map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Badge color={a.type === 'urgent' ? 'red' : a.type === 'event' ? 'green' : 'blue'}>
                  {a.type.toUpperCase()}
                </Badge>
                <span className="text-xs text-gray-500 font-medium">{a.author}</span>
              </div>
              <span className="text-xs text-gray-400">{a.date}</span>
            </div>
            <p className="text-gray-800 leading-relaxed">{a.text}</p>
          </Card>
        ))
        ) : (
          <div className="p-12 text-center text-gray-400 italic bg-white rounded-xl border border-dashed border-gray-200">
            No announcements for this date.
          </div>
        )}
      </div>
    </div>
  );
}
