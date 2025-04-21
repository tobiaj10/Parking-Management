import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Activity } from '@/hooks/use-garage';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityTableProps {
  activities: Activity[];
  isLoading: boolean;
}

export default function ActivityTable({ activities, isLoading }: ActivityTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="p-4 bg-[#212121] text-white flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <span className="material-icons mr-2" style={{ fontFamily: 'Material Icons' }}>history</span>
          Recent Activity
        </h3>
        <button className="text-sm flex items-center hover:underline">
          View All
          <span className="material-icons ml-1 text-sm" style={{ fontFamily: 'Material Icons' }}>chevron_right</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-16 w-full mb-2" />
            <Skeleton className="h-16 w-full mb-2" />
            <Skeleton className="h-16 w-full mb-2" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#757575]">No recent activity to display</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#F5F5F5]">
                <th className="py-3 px-4 text-left text-sm font-medium text-[#757575]">Ticket ID</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#757575]">License Plate</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#757575]">Entry Time</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#757575]">Exit Time</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#757575]">Duration</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#757575]">Amount</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#757575]">Status</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-b border-[#E0E0E0] hover:bg-[#F5F5F5]">
                  <td className="py-3 px-4 text-sm">{activity.ticketNumber}</td>
                  <td className="py-3 px-4 text-sm">{activity.licensePlate}</td>
                  <td className="py-3 px-4 text-sm">{formatDate(activity.entryTime)}</td>
                  <td className="py-3 px-4 text-sm">{activity.exitTime ? formatDate(activity.exitTime) : '-'}</td>
                  <td className="py-3 px-4 text-sm">
                    {activity.durationMinutes 
                      ? `${Math.round(activity.durationMinutes / 6) / 10} hrs` 
                      : activity.status === 'active' 
                        ? `${Math.round((Date.now() - new Date(activity.entryTime).getTime()) / 3600000 * 10) / 10} hrs`
                        : '-'
                    }
                  </td>
                  <td className="py-3 px-4 text-sm">{activity.amount ? formatCurrency(activity.amount) : '-'}</td>
                  <td className="py-3 px-4 text-sm">
                    {activity.status === 'active' ? (
                      <span className="px-2 py-1 bg-[#1976D2] bg-opacity-20 text-[#1976D2] rounded-full text-xs">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-[#43A047] bg-opacity-20 text-[#43A047] rounded-full text-xs">
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
