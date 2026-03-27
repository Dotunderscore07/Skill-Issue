import React from 'react';
import { Clock3 } from 'lucide-react';
import { Card } from '../../ui';
import { Routine } from '../../../modules/shared/types';
import { formatTime } from '../../../lib/dateUtils';

interface RoutineSectionProps {
  routines: Routine[];
  formattedDate: string;
}

export const RoutineSection: React.FC<RoutineSectionProps> = ({ routines, formattedDate }) => {
  return (
    <Card className="flex flex-col">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <Clock3 size={18} className="text-sky-600" />
        <h3 className="font-bold text-lg">
          Today&apos;s Routine{' '}
          <span className="text-gray-500 text-sm font-normal ml-2">{formattedDate}</span>
        </h3>
      </div>
      <div className="p-4 space-y-3 flex-1">
        {routines.length > 0 ? (
          routines.map((routine) => (
            <div key={routine.id} className="grid grid-cols-[100px_minmax(0,1fr)] gap-4">
              <div className="flex flex-col justify-center text-sm font-semibold text-gray-700">
                <span>{formatTime(routine.startTime)}</span>
                <span className="text-gray-400">{formatTime(routine.endTime)}</span>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-100/80 px-5 py-4 shadow-sm">
                <p className="text-lg font-bold text-gray-900">{routine.title}</p>
                <p className="mt-1 text-sm text-gray-700">{routine.teacherName}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center py-8 text-center">
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 w-full text-center">
              <p className="font-semibold text-gray-700">No routines scheduled for today.</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
