'use client';

import React, { useState } from 'react';
import { Button, Card } from '../ui';
import { useAppContext } from '../../modules/shared/context/AppContext';

export function CoordinatorMessagesView() {
  const { broadcastMessages, allUsers, sendBroadcastMessage } = useAppContext();
  const [text, setText] = useState('');
  const totalRecipients = allUsers.length;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    await sendBroadcastMessage(text);
    setText('');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="p-6">
        <h3 className="font-bold text-lg text-gray-900">Send Message to All Users</h3>
        <p className="text-sm text-gray-500 mt-1">Broadcast a message to the entire KinderConnect user base.</p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Write a message for all users..."
            className="w-full p-3 border border-gray-200 rounded-xl"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Recipients: {totalRecipients}</span>
            <Button type="submit">Send Broadcast</Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg">Broadcast History</h3>
        </div>
        <div className="p-4 space-y-3">
          {broadcastMessages.map((message) => (
            <div key={message.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-800">Coordinator Broadcast</span>
                <span className="text-xs text-gray-400">{message.timestamp}</span>
              </div>
              <p className="text-sm text-gray-700">{message.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
