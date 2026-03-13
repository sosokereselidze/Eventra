import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, SlidersHorizontal, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EventCard } from '@/components/events/EventCard';
import { useEvents } from '@/hooks/useEvents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORIES = ['All', 'Music', 'Technology', 'Food & Drink', 'Sports', 'Art', 'Business', 'Wellness', 'Entertainment'];

export default function Events() {
  const [page, setPage] = useState(1);
  const { data: paginatedData, isLoading } = useEvents(page, 18);
  const events = paginatedData?.events || [];
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== search) {
      setSearch(q);
    }
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value) {
      setSearchParams({ q: value }, { replace: true });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('q');
      setSearchParams(newParams, { replace: true });
    }
  };

  const filteredEvents = useMemo(() => {
    if (!events) return [];

    let filtered = events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(search.toLowerCase()) ||
        event.location.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === 'All' || event.category === category;

      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'price-low':
          return Number(a.price) - Number(b.price);
        case 'price-high':
          return Number(b.price) - Number(a.price);
        case 'popular':
          return b.tickets_booked - a.tickets_booked;
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, search, category, sortBy]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Browse Events</h1>
            <p className="text-lg text-muted-foreground">
              Find your next unforgettable experience
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events, locations..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (Soonest)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategory(cat)}
                className={category === cat ? 'glow' : ''}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {isLoading && !events.length ? 'Loading...' : `${paginatedData?.total || 0} events found`}
            </span>
          </div>

          {/* Events Grid */}
          {isLoading && !events.length ? (
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
          ) : filteredEvents.length === 0 && !isLoading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" onClick={() => { setSearch(''); setCategory('All'); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
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

              {paginatedData && paginatedData.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                    className="h-10 w-10 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Page</span>
                    <span className="text-lg font-bold">
                      {page} <span className="text-muted-foreground font-normal mx-1">/</span> {paginatedData.totalPages}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(p => Math.min(paginatedData.totalPages, p + 1))}
                    disabled={page === paginatedData.totalPages || isLoading}
                    className="h-10 w-10 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
