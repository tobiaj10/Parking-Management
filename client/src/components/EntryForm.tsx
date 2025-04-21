import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  licensePlate: z.string().min(1, "License plate is required"),
  vehicleType: z.string().min(1, "Vehicle type is required")
});

type FormData = z.infer<typeof formSchema>;

interface EntryFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  currentTime: string;
}

export default function EntryForm({ onSubmit, isLoading, currentTime }: EntryFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licensePlate: '',
      vehicleType: 'Standard Vehicle'
    }
  });

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <div className="card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg">
      <div className="bg-[#1976D2] text-white p-4">
        <h3 className="text-lg font-medium flex items-center">
          <span className="material-icons mr-2" style={{ fontFamily: 'Material Icons' }}>add_circle</span>
          Vehicle Entry
        </h3>
      </div>
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="block text-[#757575] text-sm font-medium mb-2">License Plate</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full p-2 border border-[#E0E0E0] rounded focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
                      placeholder="Enter license plate"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="block text-[#757575] text-sm font-medium mb-2">Vehicle Type</FormLabel>
                  <Select 
                    defaultValue={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full p-2 border border-[#E0E0E0] rounded focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Standard Vehicle">Standard Vehicle</SelectItem>
                      <SelectItem value="Compact Car">Compact Car</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <div className="mb-6">
              <p className="block text-[#757575] text-sm font-medium mb-2">Current Time</p>
              <p className="text-lg font-medium">{currentTime}</p>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#1976D2] hover:bg-blue-700 text-white py-3 px-4 rounded transition duration-200 flex items-center justify-center"
            >
              <span className="material-icons mr-2" style={{ fontFamily: 'Material Icons' }}>receipt_long</span>
              {isLoading ? 'Processing...' : 'Issue Parking Ticket'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
