'use client';

import React, { useState, useEffect } from 'react';
import { Send, Search, User as UserIcon } from 'lucide-react';
import { Button } from '../ui';
import { User, Message } from '../../modules/shared/types';
import { useAppContext } from '../../modules/shared/context/AppContext';

interface MessagingSystemProps {
  user: User;
  messages: Message[];
  onSend: (fromId: string, toId: string, text: string) => void;
}

export function MessagingSystem({ user, messages, onSend }: MessagingSystemProps) {
  const { allUsers, students, selectedClass, selectedChild } = useAppContext();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Relationship-based filtering logic
  const availableToSearch = React.useMemo(() => {
    if (user.role === 'teacher') {
      // Teacher can search parents of students in their selected class
      const classStudentParentIds = students
        .filter(s => s.classId === selectedClass?.id)
        .map(s => s.parentId);
      return allUsers.filter(u => u.role === 'parent' && classStudentParentIds.includes(u.id));
    } else {
      // Parent can search teachers teaching their selected child's class
      return allUsers.filter(u => u.role === 'teacher' && u.classId === selectedChild?.classId);
    }
  }, [user.role, allUsers, students, selectedClass, selectedChild]);

  // Active conversations (users we have chatted with or currently searching)
  const [activeThreads, setActiveThreads] = useState<User[]>([]);

  useEffect(() => {
    // Collect unique users from message history
    const historicalPartnerIds = new Set<string>();
    messages.forEach(m => {
      if (m.fromId === user.id) historicalPartnerIds.add(m.toId);
      if (m.toId === user.id) historicalPartnerIds.add(m.fromId);
    });

    const historicalPartners = allUsers.filter(u => historicalPartnerIds.has(u.id));
    setActiveThreads(historicalPartners);
  }, [messages, allUsers, user.id]);

  const searchResults = searchQuery.trim() 
    ? availableToSearch.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const threadMessages = messages.filter(
    (m) =>
      (m.fromId === user.id && m.toId === selectedThread) ||
      (m.fromId === selectedThread && m.toId === user.id)
  );

  const chatPartner = allUsers.find((u) => u.id === selectedThread);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;
    onSend(user.id, selectedThread, newMessage);
    setNewMessage('');
  };

  const handleSelectUser = (partner: User) => {
    setSelectedThread(partner.id);
    setSearchQuery('');
    if (!activeThreads.find((t: User) => t.id === partner.id)) {
      setActiveThreads((prev: User[]) => [...prev, partner]);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden">
      {/* Sidebar List */}
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
              {searchResults.length > 0 ? searchResults.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className="w-full text-left p-3 flex items-center gap-3 hover:bg-white rounded-lg transition-colors border-b border-gray-50 last:border-0"
                >
                  <span className="text-xl">{u.avatar}</span>
                  <p className="font-semibold text-sm text-gray-900">{u.name}</p>
                </button>
              )) : (
                <p className="text-xs text-gray-400 p-2 italic">No matches found.</p>
              )}
            </div>
          ) : (
            <>
              {activeThreads.length > 0 ? activeThreads.map((u: User) => (
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
                    <p className="text-xs text-gray-500 truncate w-32">
                      {messages.filter(m => m.fromId === u.id || m.toId === u.id).pop()?.text || 'New conversation'}
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
            </>
          )}
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
                        {m.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              {threadMessages.length === 0 && (
                <div className="text-center text-gray-400 mt-10 text-sm">
                  Start the conversation with {chatPartner.name}...
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
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-200 mb-4">
               <Send size={40} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Your Inbox</h3>
            <p className="text-sm max-w-xs">Select a parent or teacher from the list or use search to find someone new.</p>
          </div>
        )}
      </div>
    </div>
  );
}
