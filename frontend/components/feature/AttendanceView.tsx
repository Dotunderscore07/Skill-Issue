'use client';

import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, Badge } from '../ui';
import { User, AttendanceRecord, AttendanceStatus } from '../../modules/shared/types';
import { MOCK_STUDENTS } from '../../modules/shared/data/mockData';

interface AttendanceViewProps {
  user: User;
  attendance: AttendanceRecord[];
  onUpdateAttendance: (studentId: string, status: AttendanceStatus, date: string) => void;
}

export function AttendanceView({ user, attendance, onUpdateAttendance }: AttendanceViewProps) {
  const today = new Date().toISOString().split('T')[0];

  if (user.role === 'parent') {
    const myStudent = MOCK_STUDENTS.find((s) => s.id === user.studentId);
    const myAttendance = attendance
      .filter((a) => a.studentId === myStudent?.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Attendance Record</h2>
        <Card className="divide-y divide-gray-100">
          {myAttendance.map((record, idx) => (
            <div key={idx} className="p-4 flex justify-between items-center">
              <span className="font-medium text-gray-700">{record.date}</span>
              <Badge
                color={
                  record.status === 'present'
                    ? 'green'
                    : record.status === 'late'
                    ? 'yellow'
                    : 'red'
                }
              >
                {record.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Daily Attendance</h2>
        <div className="text-gray-500 bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-200">
          {today}
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600 text-sm">Student</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_STUDENTS.map((student) => {
              const record = attendance.find(
                (a) => a.studentId === student.id && a.date === today
              );
              const status: AttendanceStatus = record ? record.status : 'unmarked';

              return (
                <tr key={student.id} className="hover:bg-gray-50/50">
                  <td className="p-4 flex items-center gap-3">
                    <span className="text-xl">{student.avatar}</span>
                    <span className="font-medium text-gray-900">{student.name}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onUpdateAttendance(student.id, 'present', today)}
                        className={`p-2 rounded-lg border flex items-center gap-1 transition-all ${
                          status === 'present'
                            ? 'bg-green-100 border-green-300 text-green-700'
                            : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <CheckCircle size={16} />
                        <span className="text-xs font-medium">Present</span>
                      </button>
                      <button
                        onClick={() => onUpdateAttendance(student.id, 'late', today)}
                        className={`p-2 rounded-lg border flex items-center gap-1 transition-all ${
                          status === 'late'
                            ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                            : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <Clock size={16} />
                        <span className="text-xs font-medium">Late</span>
                      </button>
                      <button
                        onClick={() => onUpdateAttendance(student.id, 'absent', today)}
                        className={`p-2 rounded-lg border flex items-center gap-1 transition-all ${
                          status === 'absent'
                            ? 'bg-red-100 border-red-300 text-red-700'
                            : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <XCircle size={16} />
                        <span className="text-xs font-medium">Absent</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
