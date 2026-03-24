'use client';

import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { User, AttendanceRecord, AttendanceStatus, Student } from '../../modules/shared/types';
import { useAppContext } from '../../modules/shared/context/AppContext';

interface AttendanceViewProps {
  user: User;
  attendance: AttendanceRecord[];
  onUpdateAttendance: (studentId: string, status: AttendanceStatus, date: string) => Promise<void>;
}

// Month names for the custom picker
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Generate a range of years around today
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export function AttendanceView({ user, attendance, onUpdateAttendance }: AttendanceViewProps) {
  const { 
    students, 
    selectedChild, 
    selectedClass, 
    selectedDate, 
    setSelectedDate,
    authLoading: loading 
  } = useAppContext();
  
  const today = new Date().toISOString().split('T')[0];
  const isHistorical = selectedDate < today;
  const isFuture = selectedDate > today;
  const isReadOnly = isHistorical || isFuture;

  if (loading) return <div className="p-8 text-center text-gray-500">Loading attendance data...</div>;

  if (user.role === 'parent') {
    const myStudent = selectedChild;
    
    if (!myStudent) {
      return (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-2 text-gray-800">Hang tight!</h2>
          <p>Your account is not linked to a student yet. Please ask the Teacher to assign your child to you.</p>
        </div>
      );
    }

    const myAttendance = attendance
      .filter((a) => a.studentId === myStudent.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Parse month/year from selectedDate
    const selectedYear = parseInt(selectedDate.substring(0, 4), 10);
    const selectedMonth = parseInt(selectedDate.substring(5, 7), 10) - 1; // 0-indexed

    const recordsForPeriod = myAttendance.filter(a => a.date.startsWith(selectedDate.substring(0, 7)));
    const stats = {
      present: recordsForPeriod.filter(r => r.status === 'present').length,
      late: recordsForPeriod.filter(r => r.status === 'late').length,
      absent: recordsForPeriod.filter(r => r.status === 'absent').length,
      total: recordsForPeriod.length
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const month = String(parseInt(e.target.value) + 1).padStart(2, '0');
      const year = String(selectedYear);
      setSelectedDate(`${year}-${month}-01`);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const month = String(selectedMonth + 1).padStart(2, '0');
      setSelectedDate(`${e.target.value}-${month}-01`);
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Attendance History</h2>
            <p className="text-gray-500 text-sm">{myStudent.name}&apos;s attendance record</p>
          </div>
          {/* Custom month + year picker matching system style */}
          <div className="flex items-center gap-2">
            <select
              className="bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={selectedMonth}
              onChange={handleMonthChange}
            >
              {MONTHS.map((name, idx) => (
                <option key={idx} value={idx}>{name}</option>
              ))}
            </select>
            <select
              className="bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={selectedYear}
              onChange={handleYearChange}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-3 border-l-4 border-l-indigo-500">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Days</p>
              <p className="text-3xl font-black text-indigo-900">{stats.total}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3 border-l-4 border-l-green-500">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Present</p>
              <p className="text-3xl font-black text-green-800">{stats.present}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3 border-l-4 border-l-yellow-400">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Late</p>
              <p className="text-3xl font-black text-yellow-700">{stats.late}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3 border-l-4 border-l-red-500">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Absent</p>
              <p className="text-3xl font-black text-red-800">{stats.absent}</p>
            </div>
          </Card>
        </div>

        <Card className="divide-y divide-gray-100">
          <div className="p-4 bg-gray-50/50 flex justify-between items-center text-sm font-bold text-gray-500">
            <span>DATE</span>
            <span>STATUS</span>
          </div>
          {recordsForPeriod.length > 0 ? (
            recordsForPeriod.map((record, idx) => (
              <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50/30 transition-colors">
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
            ))
          ) : (
            <div className="p-12 text-center text-gray-400 italic">No records for this period.</div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Registry</h2>
          <p className="text-gray-500 text-sm">
            {isHistorical ? (
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                 Viewing Historical Data - Read-Only
              </span>
            ) : isFuture ? (
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                Future Registry - Read-Only
              </span>
            ) : (
              <span className="text-green-600 font-medium">Marking attendance for Today</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedClass && <Badge color="indigo">{selectedClass.name}</Badge>}
          <input 
            type="date"
            className="bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={selectedDate}
            max={today}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600 text-sm">Student</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.filter(s => s.classId === selectedClass?.id).map((student) => {
              const record = attendance.find(
                (a) => a.studentId === student.id && a.date === selectedDate
              );
              const status: AttendanceStatus = record ? record.status : 'unmarked';

              return (
                <tr key={student.id} className="hover:bg-gray-50/50">
                  <td className="p-4 flex items-center gap-3">
                    {student.photo ? (
                      <img src={student.photo} alt={student.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold shrink-0">
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{student.name}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => !isReadOnly && onUpdateAttendance(student.id, 'present', selectedDate)}
                        disabled={isReadOnly}
                        className={`p-2 rounded-lg border flex items-center gap-1 transition-all ${
                          status === 'present'
                            ? 'bg-green-100 border-green-300 text-green-700'
                            : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                        } ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <CheckCircle size={16} />
                        <span className="text-xs font-medium">Present</span>
                      </button>
                      <button
                        onClick={() => !isReadOnly && onUpdateAttendance(student.id, 'late', selectedDate)}
                        disabled={isReadOnly}
                        className={`p-2 rounded-lg border flex items-center gap-1 transition-all ${
                          status === 'late'
                            ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                            : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                        } ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <Clock size={16} />
                        <span className="text-xs font-medium">Late</span>
                      </button>
                      <button
                        onClick={() => !isReadOnly && onUpdateAttendance(student.id, 'absent', selectedDate)}
                        disabled={isReadOnly}
                        className={`p-2 rounded-lg border flex items-center gap-1 transition-all ${
                          status === 'absent'
                            ? 'bg-red-100 border-red-300 text-red-700'
                            : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                        } ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
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
