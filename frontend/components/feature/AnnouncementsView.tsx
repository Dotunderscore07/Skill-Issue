'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '../ui';
import { Trash, Edit } from 'lucide-react';
import { User, Announcement, AnnouncementType } from '../../modules/shared/types';
import { useAppContext } from '../../modules/shared/context/AppContext';
import { useAlert } from '../../modules/shared/context/AlertContext';

interface AnnouncementsViewProps {
  user: User;
  announcements: Announcement[];
  onAdd: (text: string, type: AnnouncementType, author: string, classId?: string) => Promise<void>;
}

export function AnnouncementsView({ user, announcements, onAdd }: AnnouncementsViewProps) {
  const { classes, updateAnnouncement, deleteAnnouncement, selectedDate, setSelectedDate, authLoading: loading } = useAppContext();
  const { confirmAction } = useAlert();
  const [text, setText] = useState('');
  const [type, setType] = useState<AnnouncementType>('info');
  const [targetClassId, setTargetClassId] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [editType, setEditType] = useState<AnnouncementType>('info');
  const [editTargetClassId, setEditTargetClassId] = useState('');

  React.useEffect(() => {
    // selectedClass is no longer destructured from useAppContext, assuming it's handled differently or not needed here.
    // If selectedClass is still needed, it would need to be re-added to useAppContext destructuring.
    // For now, commenting out the line that uses it based on the provided diff's implied changes.
    // if (!targetClassId && selectedClass) setTargetClassId(selectedClass.id);
  }, [targetClassId]); // Removed selectedClass from dependency array

  const today = new Date().toISOString().split('T')[0];
  const canPost = selectedDate === today;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;
    const classId = targetClassId || undefined;
    await onAdd(text, type, user.name, classId);
    setText('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {(user.role === 'teacher' || user.role === 'coordinator') && canPost && (
        <Card className="p-6">
          <h3 className="font-bold text-gray-900 mb-4">Post New Announcement</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              rows={3}
              placeholder={user.role === 'coordinator' ? 'What should all users know?' : 'What is happening in class?'}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AnnouncementType)}
                  className="p-2 border border-gray-200 rounded-lg text-sm bg-white"
                >
                  <option value="info">General Info</option>
                  <option value="urgent">Urgent</option>
                  <option value="event">Event</option>
                </select>
                {(user.role === 'coordinator' || user.role === 'teacher') && (
                  <select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg text-sm bg-white"
                  >
                    <option value="">All Classes</option>
                    {classes.filter(c => user.role === 'coordinator' || (user.classIds ?? []).includes(c.id)).map((entry) => (
                      <option key={entry.id} value={entry.id}>{entry.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <Button type="submit">{user.role === 'coordinator' ? 'Post Announcement' : 'Post to Class'}</Button>
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
            max={today}
          />
        </div>
        {announcements.filter((announcement) => announcement.date === selectedDate).length > 0 ? (
          announcements
            .filter((announcement) => announcement.date === selectedDate)
            .map((announcement) => {
              if (editingId === announcement.id) {
                return (
                  <Card key={announcement.id} className="p-5 border-l-4 border-indigo-500">
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      await updateAnnouncement(announcement.id, editBuffer, editType, editTargetClassId || undefined);
                      setEditingId(null);
                    }} className="space-y-4">
                      <textarea
                        className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none block"
                        rows={3}
                        value={editBuffer}
                        onChange={(e) => setEditBuffer(e.target.value)}
                      />
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <select value={editType} onChange={(e) => setEditType(e.target.value as AnnouncementType)} className="p-1.5 border border-gray-200 rounded text-sm bg-white">
                            <option value="info">General Info</option>
                            <option value="urgent">Urgent</option>
                            <option value="event">Event</option>
                          </select>
                          <select value={editTargetClassId} onChange={(e) => setEditTargetClassId(e.target.value)} className="p-1.5 border border-gray-200 rounded text-sm bg-white">
                            <option value="">All Classes</option>
                            {classes.filter(c => user.role === 'coordinator' || (user.classIds ?? []).includes(c.id)).map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" onClick={() => setEditingId(null)} className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200">Cancel</Button>
                          <Button type="submit">Save</Button>
                        </div>
                      </div>
                    </form>
                  </Card>
                );
              }

              const isAuthor = user.name === announcement.author || user.role === 'coordinator';
              const canEditOrDelete = isAuthor && (user.role === 'coordinator' || canPost);

              return (
                <Card key={announcement.id} className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge color={announcement.type === 'urgent' ? 'red' : announcement.type === 'event' ? 'green' : 'blue'}>
                        {announcement.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500 font-medium">{announcement.author}</span>
                      <span className="text-xs text-gray-400">{announcement.className ?? 'All Classes'}</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <span className="text-xs text-gray-400">{announcement.date}</span>
                      {canEditOrDelete && (
                        <div className="flex gap-2">
                          <button onClick={() => {
                            setEditingId(announcement.id);
                            setEditBuffer(announcement.text);
                            setEditType(announcement.type);
                            setEditTargetClassId(announcement.classId ?? '');
                          }} className="text-gray-400 hover:text-indigo-600"><Edit size={16} /></button>
                          <button onClick={async () => {
                            if (await confirmAction('Delete announcement?')) deleteAnnouncement(announcement.id);
                          }} className="text-gray-400 hover:text-red-600"><Trash size={16} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{announcement.text}</p>
                </Card>
              );
            })
        ) : (
          <div className="p-12 text-center text-gray-400 italic bg-white rounded-xl border border-dashed border-gray-200">
            No announcements for this date.
          </div>
        )}
      </div>
    </div>
  );
}
