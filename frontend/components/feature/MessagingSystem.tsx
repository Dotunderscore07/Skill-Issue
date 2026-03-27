'use client';

import React, { useEffect, useState } from 'react';
import { ImagePlus, Send, Search, User as UserIcon } from 'lucide-react';
import { Button } from '../ui';
import { User, Message } from '../../modules/shared/types';
import { useAppContext } from '../../modules/shared/context/AppContext';

interface MessagingSystemProps {
  user: User;
  messages: Message[];
  onSend: (toId: string, text: string, image?: string) => Promise<void>;
}

export function MessagingSystem({ user, messages, onSend }: MessagingSystemProps) {
  const { allUsers, students, classes } = useAppContext();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeThreads, setActiveThreads] = useState<User[]>([]);

  const parentClassIds = Array.from(
    new Set(
      students
        .filter((student) => student.parentId === user.id)
        .map((student) => student.classId)
    )
  );

  const teacherClasses = classes.filter((c) => (user.classIds ?? []).includes(c.id));

  const teacherStudentParentIds = Array.from(
    new Set(
      students
        .filter((student) => (user.classIds ?? []).includes(student.classId))
        .map((student) => student.parentId)
        .filter(Boolean)
    )
  );

  const availableToSearch =
    user.role === 'teacher'
      ? allUsers.filter((entry) => entry.role === 'parent' && teacherStudentParentIds.includes(entry.id))
      : allUsers.filter((entry) => entry.role === 'teacher' && (entry.classIds ?? []).some((classId) => parentClassIds.includes(classId)));

  useEffect(() => {
    const historicalPartnerIds = new Set<string>();
    messages.forEach((message) => {
      if (message.kind === 'direct') {
        if (message.fromId === user.id && message.toId) historicalPartnerIds.add(message.toId);
        if (message.toId === user.id) historicalPartnerIds.add(message.fromId);
      }
    });

    const historicalPartners = allUsers.filter((entry) => historicalPartnerIds.has(entry.id));
    const nonHistoricalPartners = availableToSearch.filter((entry) => !historicalPartnerIds.has(entry.id));
    setActiveThreads([...historicalPartners, ...nonHistoricalPartners]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, allUsers, user.id]);

  const searchResults = searchQuery.trim()
    ? availableToSearch.filter((entry) => entry.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const chatPartner = allUsers.find((entry) => entry.id === selectedThreadId);
    
  const threadMessages = messages.filter((message) => {
    return (
      message.kind === 'direct' &&
      ((message.fromId === user.id && message.toId === selectedThreadId) ||
       (message.fromId === selectedThreadId && message.toId === user.id))
    );
  });

  const handleImageChange = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if ((!newMessage.trim() && !attachedImage) || !selectedThreadId) return;
    
    await onSend(selectedThreadId, newMessage, attachedImage);
    
    setNewMessage('');
    setAttachedImage('');
  };

  const handleSelectUser = (partner: User) => {
    setSelectedThreadId(partner.id);
    setSearchQuery('');
    if (!activeThreads.find((entry) => entry.id === partner.id)) {
      setActiveThreads((prev) => [...prev, partner]);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden">
      <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <h3 className="font-bold text-gray-700">Messages</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {searchQuery.trim() ? (
            <div className="p-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">Search Results</p>
              {searchResults.length > 0 ? searchResults.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => handleSelectUser(entry)}
                  className="w-full text-left p-3 flex items-center gap-3 hover:bg-white rounded-lg transition-colors border-b border-gray-50 last:border-0"
                >
                  {entry.avatar && entry.avatar.length > 5 ? (
                    <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                      {entry.avatar || entry.name.charAt(0)}
                    </span>
                  )}
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{entry.name}</p>
                    <p className="text-xs text-gray-400">
                      {entry.role === 'teacher' ? `Classes: ${(entry.classIds ?? []).join(', ')}` : 'Parent'}
                    </p>
                  </div>
                </button>
              )) : (
                <p className="text-xs text-gray-400 p-2 italic">No matches found.</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 mt-4 mb-1">Direct Messages</p>
                {activeThreads.length > 0 ? activeThreads.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setSelectedThreadId(entry.id);
                    }}
                    className={`w-full text-left p-4 flex items-center gap-3 hover:bg-white transition-colors border-b border-gray-100 ${
                      selectedThreadId === entry.id ? 'bg-white border-l-4 border-l-indigo-500' : ''
                    }`}
                  >
                    {entry.avatar && entry.avatar.length > 5 ? (
                      <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <span className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                        {entry.avatar || entry.name.charAt(0)}
                      </span>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{entry.name}</p>
                      <p className="text-xs text-gray-500 truncate w-40">
                        {messages.filter((message) => message.kind === 'direct' && (message.fromId === entry.id || message.toId === entry.id)).pop()?.text || 'New conversation'}
                      </p>
                    </div>
                  </button>
                )) : (
                  <div className="p-8 text-center space-y-2">
                    <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-gray-400">
                      <UserIcon size={20} />
                    </div>
                    <p className="text-sm text-gray-500">No active chats.</p>
                    <p className="text-xs text-gray-400">Search for a {user.role === 'teacher' ? 'parent' : 'teacher'} to start chatting.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {chatPartner ? (
          <>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                {chatPartner?.avatar && chatPartner.avatar.length > 5 ? (
                    <img src={chatPartner.avatar} alt={chatPartner.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                      {chatPartner?.avatar || chatPartner?.name.charAt(0)}
                    </span>
                  )
                }
                <span className="font-bold text-gray-800">
                  {chatPartner?.name}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {threadMessages.map((message) => {
                const isMe = message.fromId === user.id;
                return (
                  <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                      }`}
                    >
                      {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
                      {message.image && (
                        <img src={message.image} alt="Chat attachment" className="mt-2 rounded-xl max-h-64 object-cover" />
                      )}
                      <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
              {threadMessages.length === 0 && (
                <div className="text-center text-gray-400 mt-10 text-sm">
                  Start the conversation with {chatPartner?.name}...
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 space-y-3">
              {attachedImage && (
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                  <img src={attachedImage} alt="Attachment preview" className="w-full h-full object-cover" />
                </div>
              )}
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                  <ImagePlus size={18} />
                  <span>Add Photo</span>
                  <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" className="hidden" onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)} />
                </label>
                <Button type="submit" className="min-w-24 bg-indigo-600 hover:bg-indigo-700">
                  <Send size={18} /> Send
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-200 mb-4">
              <Send size={40} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Your Inbox</h3>
            <p className="text-sm max-w-xs">Select a teacher or parent from the list.</p>
          </div>
        )}
      </div>
    </div>
  );
}
