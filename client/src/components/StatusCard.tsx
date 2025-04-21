import { cn } from '@/lib/utils';

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'secondary' | 'success';
  percentage?: number;
  details?: { label: string; value: string }[];
}

const colorMap = {
  primary: {
    border: 'border-l-[#1976D2]',
    text: 'text-[#1976D2]',
    bg: 'bg-[#1976D2]'
  },
  secondary: {
    border: 'border-l-[#F57C00]',
    text: 'text-[#F57C00]',
    bg: 'bg-[#F57C00]'
  },
  success: {
    border: 'border-l-[#43A047]',
    text: 'text-[#43A047]',
    bg: 'bg-[#43A047]'
  }
};

export default function StatusCard({ 
  title, 
  value, 
  icon, 
  color, 
  percentage, 
  details 
}: StatusCardProps) {
  const colors = colorMap[color];
  
  return (
    <div className={cn(
      "card bg-white rounded-lg shadow p-6 border-l-4 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg",
      colors.border
    )}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[#757575] text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-[#212121]">{value}</p>
        </div>
        <span 
          className={cn("material-icons text-4xl", colors.text)}
          style={{ fontFamily: 'Material Icons' }}
        >
          {icon}
        </span>
      </div>
      
      {percentage !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-[#E0E0E0] rounded-full h-2">
            <div 
              className={cn("rounded-full h-2", colors.bg)} 
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-sm text-[#757575] mt-1">{percentage}% {title.includes('Available') ? 'Available' : 'Occupied'}</p>
        </div>
      )}
      
      {details && (
        <div className="mt-4">
          {details.map((detail, index) => (
            <div key={index} className="flex justify-between items-center mt-1">
              <p className="text-sm text-[#757575]">{detail.label}</p>
              <p className="text-sm font-medium">{detail.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
