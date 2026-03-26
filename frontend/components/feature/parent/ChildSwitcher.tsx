import React from 'react';
import { User, Student } from '../../../modules/shared/types';

interface ChildSwitcherProps {
  children: Student[];
  selectedChild: Student;
  onSelect: (child: Student) => void;
}

export const ChildSwitcher: React.FC<ChildSwitcherProps> = ({ children, selectedChild, onSelect }) => {
  if (children.length <= 1) return null;

  return (
    <div className="flex bg-white rounded-lg p-1 w-full max-w-sm border shadow-sm overflow-x-auto no-scrollbar">
      <div className="flex flex-nowrap min-w-full gap-1">
        {children.map((child) => (
          <button
            key={child.id}
            onClick={() => onSelect(child)}
            className={`flex-1 whitespace-nowrap py-1.5 px-4 text-sm font-medium rounded-md transition-all ${
              selectedChild.id === child.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {child.name}
          </button>
        ))}
      </div>
    </div>
  );
};
