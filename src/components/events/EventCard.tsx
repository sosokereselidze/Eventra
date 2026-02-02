import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface EventCardProps {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  imageUrl: string | null;
  ticketsAvailable: number;
  ticketsBooked: number;
  price: number;
  category: string | null;
  featured?: boolean;
}

export function EventCard({
  id,
  title,
  description,
  date,
  location,
  imageUrl,
  ticketsAvailable,
  ticketsBooked,
  price,
  category,
  featured,
}: EventCardProps) {
  const availableTickets = ticketsAvailable - ticketsBooked;
  const soldOutPercentage = (ticketsBooked / ticketsAvailable) * 100;

  return (
    <Link to={`/events/${id}`} className="group block h-full">
      <article className="bg-card rounded-xl overflow-hidden border border-border/50 card-shadow hover:card-shadow-lg transition-all duration-300 group-hover:-translate-y-1 hover:border-primary/50 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden shrink-0">
          <img
            src={imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {featured && (
              <Badge className="gradient-bg text-primary-foreground border-none">
                Featured
              </Badge>
            )}
            {category && (
              <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
                {category}
              </Badge>
            )}
          </div>

          {/* Price */}
          <div className="absolute top-3 right-3">
            <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 font-display font-bold">
              ${price.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-display font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {description && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {description}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Meta */}
          <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{format(new Date(date), 'MMM d, yyyy • h:mm a')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>

          {/* Tickets indicator */}
          <div className="space-y-2 mt-auto">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{availableTickets} tickets left</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round(soldOutPercentage)}% sold
              </span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full gradient-bg rounded-full transition-all duration-500"
                style={{ width: `${soldOutPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
