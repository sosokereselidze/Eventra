import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, Zap, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EventCard } from '@/components/events/EventCard';
import { FeaturedEventCard } from '@/components/events/FeaturedEventCard';
import { useFeaturedEvents, useEvents } from '@/hooks/useEvents';
import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/lib/auth';

import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Index() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data: featuredEvents, isLoading: loadingFeatured } = useFeaturedEvents();
  const { data: allEventsData, isLoading: loadingEvents } = useEvents(page, 20);

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

  const upcomingEvents = allEventsData?.events || [];
  const heroEvent = featuredEvents?.[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'var(--gradient-glow)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-50" style={{ background: 'var(--gradient-glow)' }} />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Discover Amazing Events</span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
              Unforgettable
              <span className="gradient-text"> Experiences</span>
              <br />Await You
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              From concerts to conferences, discover and book tickets for the events that matter most to you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button size="lg" asChild className="text-base px-8 gap-2 glow">
                <Link to="/events">
                  Browse Events
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {user ? (
                <Button size="lg" variant="outline" asChild className="text-base px-8">
                  <Link to={isAdmin ? "/admin" : "/bookings"}>
                    {isAdmin ? "Go to Admin Panel" : "Go to Dashboard"}
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="outline" asChild className="text-base px-8">
                  <Link to="/auth?mode=signup">Create Account</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Featured Event Hero */}
          {loadingFeatured ? (
            <Skeleton className="h-[400px] md:h-[500px] rounded-2xl" />
          ) : heroEvent ? (
            <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <FeaturedEventCard
                id={heroEvent.id}
                title={heroEvent.title}
                description={heroEvent.description}
                date={heroEvent.date}
                location={heroEvent.location}
                imageUrl={heroEvent.image_url}
                price={Number(heroEvent.price)}
                category={heroEvent.category}
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-2xl mb-3">Instant Booking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Secure your tickets in seconds with our streamlined booking process.
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-2xl mb-3">Curated Events</h3>
              <p className="text-muted-foreground leading-relaxed">
                Discover handpicked events from music festivals to tech conferences.
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-2xl mb-3">Secure & Safe</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your transactions are protected with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Upcoming Events</h2>
              <p className="text-muted-foreground">Don't miss out on these amazing experiences</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex gap-2">
              <Link to="/events">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loadingEvents ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[16/10] rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  date={event.date}
                  location={event.location}
                  imageUrl={event.image_url}
                  ticketsAvailable={event.tickets_available}
                  ticketsBooked={event.tickets_booked}
                  price={Number(event.price)}
                  category={event.category}
                  featured={event.featured}
                />
              ))}
            </div>
          )}

          {allEventsData && allEventsData.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loadingEvents}
                className="h-10 w-10 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground uppercase tracking-tighter font-bold opacity-70">Page</span>
                <span className="text-xl font-black">
                  {page} <span className="text-muted-foreground font-light mx-1">/</span> {allEventsData.totalPages}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.min(allEventsData.totalPages, p + 1))}
                disabled={page === allEventsData.totalPages || loadingEvents}
                className="h-10 w-10 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            {!allEventsData || allEventsData.totalPages <= 1 ? (
              <Button variant="outline" asChild className="gap-2">
                <Link to="/events">
                  View All Events
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 gradient-bg opacity-10" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
                Ready to Discover Your Next Adventure?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of event-goers who trust Eventra for their unforgettable experiences.
              </p>
              <Button size="lg" asChild className="text-base px-10 glow">
                <Link to="/auth?mode=signup">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
