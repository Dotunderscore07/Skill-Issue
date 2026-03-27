import React from 'react';
import { Bell } from 'lucide-react';
import { Card, Badge } from '../../ui';
import { Announcement } from '../../../modules/shared/types';

interface AnnouncementSectionProps {
  announcements: Announcement[];
}

export const AnnouncementSection: React.FC<AnnouncementSectionProps> = ({ announcements }) => {
  return (
    <Card className="flex flex-col">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <Bell size={18} className="text-indigo-600" />
        <h3 className="font-bold text-lg">Recent Announcements</h3>
      </div>
      <div className="p-4 space-y-4 flex-1">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div key={announcement.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge color={announcement.type === 'urgent' ? 'red' : announcement.type === 'event' ? 'green' : 'blue'}>
                    {announcement.type}
                  </Badge>
                  <span className="text-xs text-gray-500 font-medium">{announcement.author}</span>
                  <span className="text-xs text-gray-400">{announcement.className ?? 'All Classes'}</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{announcement.date}</span>
              </div>
              <p className="text-sm text-gray-800">{announcement.text}</p>
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 w-full text-center">
              <p className="font-semibold text-gray-700">No announcements yet.</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
