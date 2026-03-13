import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  image_url: string | null;
  tickets_available: number;
  tickets_booked: number;
  price: number;
  category: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  event_id: string;
  quantity: number;
  status: string;
  created_at: string;
  events?: Event;
}

export function useEvents(limit?: number) {
  return useQuery({
    queryKey: ['events', limit],
    queryFn: () => fetchApi<Event[]>(`/api/events${limit ? `?limit=${limit}` : ''}`),
  });
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: ['events', 'featured'],
    queryFn: () => fetchApi<Event[]>('/api/events/featured'),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => fetchApi<Event>(`/api/events/${id}`),
    enabled: !!id,
  });
}

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => fetchApi<Booking[]>('/api/bookings'),
  });
}

export function useBookEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ eventId, quantity = 1 }: { eventId: string; quantity?: number }) => {
      const res = await fetchApi<{ success: boolean; error?: string; booking_id?: string }>(
        '/api/bookings',
        { method: 'POST', body: JSON.stringify({ eventId, quantity }) }
      );
      if (!res.success) throw new Error(res.error || 'Failed to book event');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast({
        title: 'Booking Confirmed!',
        description: 'Your ticket has been reserved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Booking Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await fetchApi<{ success: boolean; error?: string }>(
        `/api/bookings/${bookingId}`,
        { method: 'DELETE' }
      );
      if (!res.success) throw new Error(res.error || 'Failed to cancel booking');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled and tickets have been returned.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Cancellation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
