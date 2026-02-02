import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, ArrowLeft, Share2, Heart, Ticket, Clock } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvent, useBookEvent, useBookings } from '@/hooks/useEvents';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: event, isLoading } = useEvent(id || '');
  const { data: bookings } = useBookings();
  const bookEvent = useBookEvent();

  const isBooked = bookings?.some((b) => b.event_id === id);
  const availableTickets = event ? event.tickets_available - event.tickets_booked : 0;
  const soldOutPercentage = event ? (event.tickets_booked / event.tickets_available) * 100 : 0;

  const handleBook = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to book tickets.',
      });
      navigate('/auth');
      return;
    }

    if (!id) return;
    bookEvent.mutate({ eventId: id });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event?.title,
        text: event?.description || '',
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Event link copied to clipboard.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          <Skeleton className="h-[50vh] w-full" />
          <div className="container mx-auto px-4 py-10">
            <Skeleton className="h-10 w-2/3 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-40 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center py-20">
            <h1 className="font-display text-3xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/events">Browse Events</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        {/* Hero Image */}
        <div className="relative h-[40vh] md:h-[50vh]">
          <img
            src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-20 left-4 bg-black/20 backdrop-blur-md hover:bg-black/40 text-white rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Actions */}
          <div className="absolute top-20 right-4 flex gap-2">
            <Button variant="ghost" size="icon" className="bg-black/20 backdrop-blur-md hover:bg-black/40 text-white rounded-full" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-black/20 backdrop-blur-md hover:bg-black/40 text-white rounded-full">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-24 relative pb-32">
          <div className="bg-[#25140e] rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-3 gap-12 text-white">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                <div>
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {event.featured && (
                      <Badge className="bg-primary hover:bg-primary/90 text-white border-none px-3 py-1">Featured</Badge>
                    )}
                    {event.category && (
                      <Badge variant="outline" className="text-zinc-400 border-zinc-700 px-3 py-1">{event.category}</Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 leading-tight">
                    {event.title}
                  </h1>

                  {/* Meta Info Grid */}
                  <div className="grid sm:grid-cols-2 gap-8 py-8 border-y border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-white/5 text-primary">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Date & Time</p>
                        <p className="font-bold text-lg">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                        <p className="text-sm text-zinc-400">{format(new Date(event.date), 'h:mm a')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-white/5 text-primary">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Location</p>
                        <p className="font-bold text-lg">{event.location}</p>
                        <p className="text-sm text-zinc-400">Main Venue</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    About This Event
                  </h2>
                  <p className="text-zinc-300 leading-relaxed text-lg whitespace-pre-line max-w-none">
                    {event.description || 'No description available for this experience.'}
                  </p>
                </div>
              </div>

              {/* Booking Column */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-28 space-y-8 bg-white/5 p-8 rounded-3xl border border-white/5">
                  {/* Price */}
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Secure Your Ticket</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">${Number(event.price).toFixed(0)}</span>
                      <span className="text-zinc-500 font-medium">/ person</span>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-zinc-400 font-medium">
                        <Users className="h-5 w-5" />
                        <span>{availableTickets} tickets remaining</span>
                      </div>
                      <span className="font-bold text-primary">{Math.round(soldOutPercentage)}% Sold</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${soldOutPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Book Button */}
                  {isBooked ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                        <Ticket className="h-6 w-6" />
                        <span className="font-bold text-lg">See You There!</span>
                      </div>
                      <Button variant="outline" className="w-full h-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold" asChild>
                        <Link to="/bookings">View My Bookings</Link>
                      </Button>
                    </div>
                  ) : availableTickets === 0 ? (
                    <Button disabled className="w-full h-16 rounded-2xl bg-white/5 text-zinc-600 font-bold" size="lg">
                      Event Sold Out
                    </Button>
                  ) : (
                    <Button
                      className="w-full h-16 rounded-2xl text-lg font-bold glow shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                      size="lg"
                      onClick={handleBook}
                      disabled={bookEvent.isPending}
                    >
                      {bookEvent.isPending ? 'Booking...' : 'Book Tickets Now'}
                    </Button>
                  )}

                  {/* Quick Info */}
                  <div className="pt-8 border-t border-white/5">
                    <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Instant confirmation upon booking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
