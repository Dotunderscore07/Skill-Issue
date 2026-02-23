'use client';

import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui';
import { User, Message } from '../../modules/shared/types';
import { MOCK_USERS, MOCK_STUDENTS } from '../../modules/shared/data/mockData';

interface MessagingSystemProps {
  user: User;
  messages: Message[];
  onSend: (fromId: string, toId: string, text: string) => void;
}

export function MessagingSystem({ user, messages, onSend }: MessagingSystemProps) {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const availableChats = user.role === 'teacher'
    ? MOCK_USERS.filter((u) => u.role === 'parent')
    : MOCK_USERS.filter((u) => u.role === 'teacher');

  useEffect(() => {
    if (!selectedThread && availableChats.length > 0) {
      setSelectedThread(availableChats[0].id);
    }
  }, [user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const threadMessages = messages.filter(
    (m) =>
      (m.fromId === user.id && m.toId === selectedThread) ||
      (m.fromId === selectedThread && m.toId === user.id)
  );

  const chatPartner = MOCK_USERS.find((u) => u.id === selectedThread);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;
    onSend(user.id, selectedThread, newMessage);
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden">
      {/* Sidebar List */}
      <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-100 font-bold text-gray-700">Conversations</div>
        <div className="flex-1 overflow-y-auto">
          {availableChats.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedThread(u.id)}
              className={`w-full text-left p-4 flex items-center gap-3 hover:bg-white transition-colors border-b border-gray-100 ${
                selectedThread === u.id ? 'bg-white border-l-4 border-l-indigo-500' : ''
              }`}
            >
              <span className="text-xl">{u.avatar}</span>
              <div>
                <p className="font-semibold text-sm text-gray-900">{u.name}</p>
                <p className="text-xs text-gray-500">
                  {u.role === 'parent'
                    ? `Parent of ${MOCK_STUDENTS.find((s) => s.parentId === u.id)?.name}`
                    : 'Class Teacher'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {chatPartner ? (
          <>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{chatPartner.avatar}</span>
                <span className="font-bold text-gray-800">{chatPartner.name}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {threadMessages.map((m) => {
                const isMe = m.fromId === user.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm">{m.text}</p>
                      <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {m.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
              {threadMessages.length === 0 && (
                <div className="text-center text-gray-400 mt-10 text-sm">
                  Start the conversation...
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button type="submit" className="w-12 h-10 !px-0 flex items-center justify-center">
                <Send size={18} />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
