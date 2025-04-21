import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StatusCard from '@/components/StatusCard';
import EntryForm from '@/components/EntryForm';
import ExitForm from '@/components/ExitForm';
import ActivityTable from '@/components/ActivityTable';
import OccupancyChart from '@/components/OccupancyChart';
import TicketModal from '@/components/TicketModal';
import PaymentModal from '@/components/PaymentModal';
import { useGarage } from '@/hooks/use-garage';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const {
    stats,
    statsLoading,
    activities,
    activitiesLoading,
    ticketModalOpen,
    setTicketModalOpen,
    paymentModalOpen,
    setPaymentModalOpen,
    newTicket,
    processedTicket,
    issueTicket,
    fetchTicket,
    processExit
  } = useGarage();

  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleString('en-US', { 
      weekday: 'long',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  );

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleString('en-US', { 
          weekday: 'long',
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })
      );
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
      <Header currentTime={currentTime} />
      
      <main className="flex-grow p-6 overflow-auto">
        <div className="container mx-auto">
          {/* Garage Status Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-medium text-[#212121] mb-4">Garage Status Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statsLoading ? (
                <>
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                </>
              ) : (
                <>
                  <StatusCard 
                    title="Available Spaces"
                    value={stats?.availableSpaces}
                    percentage={stats?.availableSpacesPercentage}
                    icon="directions_car"
                    color="primary"
                  />
                  <StatusCard 
                    title="Occupied Spaces"
                    value={stats?.occupiedSpaces}
                    percentage={stats?.occupiedSpacesPercentage}
                    icon="car_rental"
                    color="secondary"
                  />
                  <StatusCard 
                    title="Today's Revenue"
                    value={`$${stats?.todaysRevenue.toFixed(2)}`}
                    details={[
                      { label: "Vehicles processed:", value: stats?.vehiclesProcessedToday.toString() },
                      { label: "Avg. stay time:", value: `${stats?.averageStayTime} hrs` }
                    ]}
                    icon="payments"
                    color="success"
                  />
                </>
              )}
            </div>
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <EntryForm 
              onSubmit={(data) => issueTicket.mutate(data)}
              isLoading={issueTicket.isPending}
              currentTime={new Date().toFormattedString()}
            />
            
            <ExitForm 
              onSubmit={(data) => processExit.mutate(data)}
              onSearch={(ticketNumber) => fetchTicket.mutate(ticketNumber)}
              isLoadingSearch={fetchTicket.isPending}
              isLoadingSubmit={processExit.isPending}
              ticket={fetchTicket.data}
              currentTime={new Date().toFormattedString()}
              hourlyRate={stats?.hourlyRate || 10}
            />
          </div>

          {/* Recent Activity */}
          <ActivityTable 
            activities={activities || []}
            isLoading={activitiesLoading}
          />

          {/* Occupancy Chart */}
          <OccupancyChart />
        </div>
      </main>
      
      <Footer />
      
      {/* Modals */}
      <TicketModal 
        isOpen={ticketModalOpen} 
        onClose={() => setTicketModalOpen(false)} 
        ticket={newTicket}
      />
      
      <PaymentModal 
        isOpen={paymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
        ticket={processedTicket}
      />
    </div>
  );
}
