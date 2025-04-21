import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ChartButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function ChartButton({ label, active, onClick }: ChartButtonProps) {
  return (
    <button 
      className={`px-3 py-1 text-sm border rounded transition duration-200 ${
        active 
          ? 'border-[#1976D2] bg-[#1976D2] bg-opacity-10 text-[#1976D2]' 
          : 'border-[#E0E0E0] bg-[#F5F5F5] hover:bg-[#E0E0E0]'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function OccupancyChart() {
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('week');
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="p-4 bg-[#212121] text-white">
        <h3 className="text-lg font-medium flex items-center">
          <span className="material-icons mr-2" style={{ fontFamily: 'Material Icons' }}>analytics</span>
          Occupancy Over Time
        </h3>
      </div>
      <div className="p-6">
        <div className="flex justify-end space-x-2 mb-4">
          <ChartButton 
            label="Day" 
            active={activeTab === 'day'} 
            onClick={() => setActiveTab('day')} 
          />
          <ChartButton 
            label="Week" 
            active={activeTab === 'week'} 
            onClick={() => setActiveTab('week')} 
          />
          <ChartButton 
            label="Month" 
            active={activeTab === 'month'} 
            onClick={() => setActiveTab('month')} 
          />
        </div>
        <div className="h-64 w-full">
          <div className="w-full h-full bg-[#F5F5F5] rounded flex items-center justify-center">
            <div className="text-center">
              <span className="material-icons text-5xl text-[#757575]" style={{ fontFamily: 'Material Icons' }}>bar_chart</span>
              <p className="text-[#757575] mt-2">Occupancy Chart Visualization</p>
              <p className="text-sm text-[#757575]">(Will display real data as it becomes available)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
