import React from 'react';
import { Clock3 } from 'lucide-react';
import { Card } from '../../ui';
import { Routine, Class } from '../../../modules/shared/types';
import { formatTime } from '../../../lib/dateUtils';

interface CoordinatorRoutineSectionProps {
  routines: Routine[];
  allClasses: Class[];
  selectedClass: Class | null;
  setSelectedClass: (cls: Class) => void;
  formattedDate: string;
}

export const CoordinatorRoutineSection: React.FC<CoordinatorRoutineSectionProps> = ({
  routines,
  allClasses,
  selectedClass,
  setSelectedClass,
  formattedDate,
}) => {
  return (
    <Card className="flex flex-col">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock3 size={18} className="text-sky-600" />
          <h3 className="font-bold text-lg">
            Today&apos;s Routine <span className="text-gray-500 text-sm font-normal ml-2">{formattedDate}</span>
          </h3>
        </div>
        {allClasses.length > 0 && (
          <select
            className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 max-w-[140px] md:max-w-[200px]"
            value={selectedClass?.id || ''}
            onChange={(e) => {
              const targetClass = allClasses.find((entry) => entry.id === e.target.value);
              if (targetClass) setSelectedClass(targetClass);
            }}
          >
            {allClasses.map((entry) => (
              <option key={entry.id} value={entry.id}>{entry.name}</option>
            ))}
          </select>
        )}
      </div>
      <div className="p-4 space-y-4">
        {routines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
            <p className="font-semibold text-gray-700">No periods scheduled for today.</p>
            <p className="mt-1 text-sm text-gray-500">Open the routines tab to view the full weekly routine.</p>
          </div>
        ) : (
          routines.map((routine) => (
            <div key={routine.id} className="grid grid-cols-[100px_minmax(0,1fr)] gap-4">
              <div className="flex flex-col justify-center text-sm font-semibold text-gray-700">
                <span>{formatTime(routine.startTime)}</span>
                <span className="text-gray-400">{formatTime(routine.endTime)}</span>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-100/80 px-5 py-4 shadow-sm">
                <p className="text-lg font-bold text-gray-900">{routine.title}</p>
                <p className="mt-2 text-sm text-gray-700">{routine.teacherName ?? 'Assigned teacher'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
