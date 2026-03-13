import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '@/lib/api';

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

// Generic fetch hook
function useFetch<T>(fetchFn: () => Promise<T>, deps: unknown[] = []) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchFn();
            setData(result);
        } catch (e) {
            setError(e instanceof Error ? e : new Error('Failed to fetch'));
        } finally {
            setIsLoading(false);
        }
    }, deps);

    useEffect(() => {
        load();
    }, [load]);

    return { data, isLoading, error, refetch: load };
}

export function useEvents() {
    return useFetch<Event[]>(() => fetchApi<Event[]>('/api/events'));
}

export function useFeaturedEvents() {
    return useFetch<Event[]>(() => fetchApi<Event[]>('/api/events/featured'));
}

export function useEvent(id: string) {
    return useFetch<Event>(() => fetchApi<Event>(`/api/events/${id}`), [id]);
}

export function useBookings() {
    return useFetch<Booking[]>(() => fetchApi<Booking[]>('/api/bookings'));
}
