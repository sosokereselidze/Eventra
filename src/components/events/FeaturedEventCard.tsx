import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface FeaturedEventCardProps {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  imageUrl: string | null;
  price: number;
  category: string | null;
}

export function FeaturedEventCard({
  id,
  title,
  description,
  date,
  location,
  imageUrl,
  price,
  category,
}: FeaturedEventCardProps) {
  return (
    <Link to={`/events/${id}`} className="group block">
      <article className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
        {/* Background Image */}
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200'}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="flex gap-2 mb-4">
            <Badge className="gradient-bg text-primary-foreground border-none">
              Featured
            </Badge>
            {category && (
              <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
                {category}
              </Badge>
            )}
          </div>
          
          <h3 className="font-display font-bold text-2xl md:text-4xl mb-3 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          {description && (
            <p className="text-muted-foreground text-sm md:text-base mb-4 line-clamp-2 max-w-2xl">
              {description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{format(new Date(date), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="font-display">
              <span className="text-muted-foreground text-sm">From</span>
              <span className="text-2xl font-bold ml-2">${price.toFixed(0)}</span>
            </div>
            <Button className="group/btn gap-2">
              Get Tickets
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
}
