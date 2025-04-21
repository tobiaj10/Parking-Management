import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDuration } from '@/lib/utils';
import { differenceInMinutes } from 'date-fns';

const formSchema = z.object({
  ticketNumber: z.string().min(1, "Ticket number is required"),
  paymentMethod: z.string().min(1, "Payment method is required")
});

type FormData = z.infer<typeof formSchema>;

interface ExitFormProps {
  onSubmit: (data: { ticketNumber: string; paymentMethod: string }) => void;
  onSearch: (ticketNumber: string) => void;
  isLoadingSearch: boolean;
  isLoadingSubmit: boolean;
  ticket: any; // The fetched ticket
  currentTime: string;
  hourlyRate: number;
}

export default function ExitForm({ 
  onSubmit, 
  onSearch, 
  isLoadingSearch,
  isLoadingSubmit,
  ticket, 
  currentTime,
  hourlyRate
}: ExitFormProps) {
  const [totalDue, setTotalDue] = useState<number | null>(null);
  const [duration, setDuration] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticketNumber: '',
      paymentMethod: 'Credit Card'
    }
  });

  // Calculate fee and duration when ticket changes
  useEffect(() => {
    if (ticket && ticket.status === 'active') {
      const entryTime = new Date(ticket.entryTime);
      const now = new Date();
      const durationMinutes = differenceInMinutes(now, entryTime);
      const hours = Math.ceil(durationMinutes / 60);
      const fee = hours * hourlyRate;
      
      setTotalDue(fee);
      setDuration(formatDuration(durationMinutes));
    } else {
      setTotalDue(null);
      setDuration(null);
    }
  }, [ticket, hourlyRate]);

  const handleSearch = () => {
    const ticketNumber = form.getValues('ticketNumber');
    if (ticketNumber) {
      onSearch(ticketNumber);
    }
  };

  const handleSubmit = (data: FormData) => {
    if (ticket && ticket.status === 'active') {
      onSubmit({
        ticketNumber: data.ticketNumber,
        paymentMethod: data.paymentMethod
      });
      form.reset();
      setTotalDue(null);
      setDuration(null);
    }
  };

  return (
    <div className="card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg">
      <div className="bg-[#F57C00] text-white p-4">
        <h3 className="text-lg font-medium flex items-center">
          <span className="material-icons mr-2" style={{ fontFamily: 'Material Icons' }}>payment</span>
          Exit & Payment
        </h3>
      </div>
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="ticketNumber"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="block text-[#757575] text-sm font-medium mb-2">Ticket ID</FormLabel>
                  <div className="flex">
                    <FormControl>
                      <Input
                        {...field}
                        className="flex-grow p-2 border border-[#E0E0E0] rounded-l focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent"
                        placeholder="Enter ticket ID"
                      />
                    </FormControl>
                    <Button 
                      type="button" 
                      onClick={handleSearch}
                      disabled={isLoadingSearch || !field.value}
                      className="bg-[#E0E0E0] px-4 rounded-r flex items-center"
                    >
                      <span className="material-icons" style={{ fontFamily: 'Material Icons' }}>
                        {isLoadingSearch ? 'hourglass_empty' : 'search'}
                      </span>
                    </Button>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="mb-6 p-4 bg-[#F5F5F5] rounded border border-[#E0E0E0]">
              {ticket && ticket.status === 'active' ? (
                <>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#757575] text-sm">Entry Time:</span>
                    <span className="font-medium">
                      {new Date(ticket.entryTime).toFormattedString()}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#757575] text-sm">Current Time:</span>
                    <span className="font-medium">{currentTime}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#757575] text-sm">Duration:</span>
                    <span className="font-medium">{duration}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#757575] text-sm">Rate:</span>
                    <span className="font-medium">{formatCurrency(hourlyRate)} per hour</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-2 border-t border-[#E0E0E0]">
                    <span>Total Due:</span>
                    <span className="text-[#E53935]">
                      {totalDue !== null ? formatCurrency(totalDue) : '-'}
                    </span>
                  </div>
                </>
              ) : ticket && ticket.status === 'completed' ? (
                <div className="text-center py-2">
                  <p className="text-[#E53935] font-medium">
                    This ticket has already been processed.
                  </p>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-[#757575]">
                    Enter a ticket number and click search to view details
                  </p>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="block text-[#757575] text-sm font-medium mb-2">Payment Method</FormLabel>
                  <Select 
                    defaultValue={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full p-2 border border-[#E0E0E0] rounded focus:outline-none focus:ring-2 focus:ring-[#F57C00] focus:border-transparent">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Mobile Payment">Mobile Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={isLoadingSubmit || !ticket || ticket.status !== 'active'}
              className="w-full bg-[#F57C00] hover:bg-orange-600 text-white py-3 px-4 rounded transition duration-200 flex items-center justify-center"
            >
              <span className="material-icons mr-2" style={{ fontFamily: 'Material Icons' }}>check_circle</span>
              {isLoadingSubmit ? 'Processing...' : 'Process Payment & Exit'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
