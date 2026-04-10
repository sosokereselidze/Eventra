import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, Ticket, Trash2, ExternalLink, Download, QrCode } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useBookings, useCancelBooking } from '@/hooks/useEvents';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Bookings() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: bookings, isLoading } = useBookings();
  const cancelBooking = useCancelBooking();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">My Bookings</h1>
            <p className="text-lg text-muted-foreground">
              Manage your upcoming events
            </p>
          </div>

          {/* Bookings List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : !bookings || bookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Ticket className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">
                Start exploring and book your first event!
              </p>
              <Button asChild>
                <Link to="/events">Browse Events</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const event = booking.events;
                if (!event) return null;

                const isPast = new Date(event.date) < new Date();

                return (
                  <div
                    key={booking.id}
                    className={`bg-card rounded-xl p-6 card-shadow ${isPast ? 'opacity-60' : ''}`}
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image */}
                      <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 relative group">
                        <img
                          src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400'}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        {!isPast && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <QrCode className="h-12 w-12 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={isPast ? 'secondary' : 'default'} className={!isPast ? 'gradient-bg text-primary-foreground border-none' : ''}>
                                {isPast ? 'Past Event' : 'Confirmed'}
                              </Badge>
                              {event.category && (
                                <Badge variant="outline">{event.category}</Badge>
                              )}
                            </div>
                            <h3 className="font-display text-xl font-bold">{event.title}</h3>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy • h:mm a')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-primary" />
                            <span>{booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/events/${event.id}`} className="gap-2">
                              <ExternalLink className="h-4 w-4" />
                              View Event
                            </Link>
                          </Button>

                          {!isPast && (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => window.open(`/api/bookings/${booking.id}/ticket`, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                              Ticket
                            </Button>
                          )}
                          
                          {!isPast && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-2">
                                  <Trash2 className="h-4 w-4" />
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel your booking for "{event.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => cancelBooking.mutate(booking.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Cancel Booking
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
