import React from 'react';
import { Card } from '../../ui';
import { LucideIcon } from 'lucide-react';

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
}

interface StatsGridProps {
  stats: Stat[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map(({ label, value, icon: Icon, accent }) => (
        <Card key={label} className="p-5 flex items-center gap-4 border-l-4">
          <div className={`p-3 rounded-full ${accent}`}>
            <Icon />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};
