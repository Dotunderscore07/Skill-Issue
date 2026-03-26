import React from 'react';
import { Users } from 'lucide-react';
import { Card } from '../../ui';

interface TeacherStatsGridProps {
  presentCount: number;
  totalStudents: number;
  parentsCount: number;
  classTeachersCount: number;
}

export const TeacherStatsGrid: React.FC<TeacherStatsGridProps> = ({
  presentCount,
  totalStudents,
  parentsCount,
  classTeachersCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-5 flex items-center gap-4 border-l-4 border-l-green-500">
        <div className="bg-green-100 p-3 rounded-full">
          <Users className="text-green-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Attendance</p>
          <p className="text-2xl font-bold">{presentCount} / {totalStudents || '-'}</p>
        </div>
      </Card>
      <Card className="p-5 flex items-center gap-4 border-l-4 border-l-blue-500">
        <div className="bg-blue-100 p-3 rounded-full">
          <Users className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Parents</p>
          <p className="text-2xl font-bold">{parentsCount}</p>
        </div>
      </Card>
      <Card className="p-5 flex items-center gap-4 border-l-4 border-l-purple-500">
        <div className="bg-purple-100 p-3 rounded-full">
          <Users className="text-purple-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Teachers</p>
          <p className="text-2xl font-bold">{classTeachersCount}</p>
        </div>
      </Card>
    </div>
  );
};
