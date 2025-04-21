import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Ticket } from '@/hooks/use-garage';
import { formatCurrency, formatDuration } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

export default function PaymentModal({ isOpen, onClose, ticket }: PaymentModalProps) {
  if (!ticket) return null;

  const handlePrint = () => {
    // In a real application, this would trigger printing
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 mx-4">
        <DialogHeader>
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-xl font-medium text-[#212121]">Payment Receipt</DialogTitle>
            <Button variant="ghost" onClick={onClose} className="text-[#757575] hover:text-[#212121]">
              <span className="material-icons" style={{ fontFamily: 'Material Icons' }}>close</span>
            </Button>
          </div>
        </DialogHeader>
        
        <div className="bg-[#F5F5F5] p-4 rounded mb-4 border border-[#E0E0E0]">
          <div className="flex justify-between mb-2">
            <span className="text-[#757575]">Ticket ID:</span>
            <span className="font-medium">{ticket.ticketNumber}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-[#757575]">License Plate:</span>
            <span className="font-medium">{ticket.licensePlate}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-[#757575]">Entry Time:</span>
            <span className="font-medium">
              {new Date(ticket.entryTime).toFormattedString()}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-[#757575]">Exit Time:</span>
            <span className="font-medium">
              {ticket.exitTime ? new Date(ticket.exitTime).toFormattedString() : '-'}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-[#757575]">Duration:</span>
            <span className="font-medium">
              {ticket.durationMinutes ? formatDuration(ticket.durationMinutes) : '-'}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-[#757575]">Rate:</span>
            <span className="font-medium">$10.00 per hour</span>
          </div>
          <div className="flex justify-between font-medium text-lg pt-2 border-t border-[#E0E0E0]">
            <span>Total Paid:</span>
            <span className="text-[#43A047]">
              {ticket.amountPaid ? formatCurrency(ticket.amountPaid / 100) : '-'}
            </span>
          </div>
        </div>
        
        <div className="text-sm text-[#757575] mb-4">
          <p>Payment successfully processed. Thank you for using ParkSmart Garage System!</p>
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={handlePrint}
            className="bg-[#F57C00] hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-200 flex items-center"
          >
            <span className="material-icons mr-2" style={{ fontFamily: 'Material Icons' }}>print</span>
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
