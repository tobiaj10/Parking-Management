import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface GarageStats {
  totalSpaces: number;
  occupiedSpaces: number;
  availableSpaces: number;
  occupiedSpacesPercentage: number;
  availableSpacesPercentage: number;
  hourlyRate: number;
  todaysRevenue: number;
  vehiclesProcessedToday: number;
  averageStayTime: number;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  licensePlate: string;
  vehicleType: string;
  entryTime: string;
  exitTime: string | null;
  durationMinutes: number | null;
  amountPaid: number | null;
  status: string;
  paymentMethod: string | null;
}

export interface Activity {
  id: number;
  ticketNumber: string;
  licensePlate: string;
  entryTime: string;
  exitTime: string | null;
  durationMinutes: number | null;
  amount: number | null;
  status: string;
}

export function useGarage() {
  const { toast } = useToast();
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState<Ticket | null>(null);
  const [processedTicket, setProcessedTicket] = useState<Ticket | null>(null);

  // Fetch garage statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/garage/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent activities
  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useQuery({
    queryKey: ['/api/activities'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Mutation for creating a new ticket
  const issueTicket = useMutation({
    mutationFn: async (data: { licensePlate: string; vehicleType: string }) => {
      const res = await apiRequest('POST', '/api/tickets', data);
      return res.json();
    },
    onSuccess: (data) => {
      setNewTicket(data);
      setTicketModalOpen(true);
      queryClient.invalidateQueries({ queryKey: ['/api/garage/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Ticket Issued",
        description: `Ticket ${data.ticketNumber} has been issued successfully.`
      });
    },
    onError: (error) => {
      console.error('Error issuing ticket:', error);
      toast({
        title: "Error",
        description: "Failed to issue ticket. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation for fetching a ticket by number
  const fetchTicket = useMutation({
    mutationFn: async (ticketNumber: string) => {
      const res = await apiRequest('GET', `/api/tickets/${ticketNumber}`, undefined);
      return res.json();
    },
    onError: (error) => {
      console.error('Error fetching ticket:', error);
      toast({
        title: "Error",
        description: "Ticket not found or invalid. Please check the ticket number.",
        variant: "destructive"
      });
    }
  });

  // Mutation for processing exit and payment
  const processExit = useMutation({
    mutationFn: async ({ ticketNumber, paymentMethod }: { ticketNumber: string; paymentMethod: string }) => {
      const res = await apiRequest('PUT', `/api/tickets/${ticketNumber}/exit`, { paymentMethod });
      return res.json();
    },
    onSuccess: (data) => {
      setProcessedTicket(data);
      setPaymentModalOpen(true);
      queryClient.invalidateQueries({ queryKey: ['/api/garage/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Payment Processed",
        description: `Ticket ${data.ticketNumber} has been processed successfully.`
      });
    },
    onError: (error) => {
      console.error('Error processing exit:', error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    stats: stats as GarageStats,
    statsLoading,
    statsError,
    activities: activities as Activity[],
    activitiesLoading,
    activitiesError,
    ticketModalOpen,
    setTicketModalOpen,
    paymentModalOpen,
    setPaymentModalOpen,
    newTicket,
    processedTicket,
    issueTicket,
    fetchTicket,
    processExit
  };
}
