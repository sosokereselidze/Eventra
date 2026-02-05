import { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { CalendarDays, Menu, X, User, LogOut, LayoutDashboard, Ticket, Search as SearchIcon, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEvents } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminPage = location.pathname === '/admin';

  const [searchQuery, setSearchQuery] = useState('');
  const { data: events } = useEvents();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || !events) return [];
    return events
      .filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 3);
  }, [searchQuery, events]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#25140e]/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="h-14 w-14 flex items-center justify-center overflow-hidden">
              <img src="/eventra_logo.png" alt="Eventra Logo" className="w-full h-full mt-2 object-contain" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-white">Eventra</span>
          </Link>

          {/* Search Bar */}
          {!isAdminPage && (
            <div className="hidden lg:block relative max-w-xl w-full mx-8">
              <form onSubmit={handleSearch} className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search events, locations..."
                  className="pl-11 h-10 bg-white/10 border-none focus-visible:ring-primary/20 rounded-full text-white placeholder:text-zinc-500 w-full"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#25140e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    {suggestions.map((event) => (
                      <button
                        key={event.id}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-left group"
                        onMouseDown={() => handleSuggestionClick(event.id)}
                      >
                        {event.image_url ? (
                          <img src={event.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500">
                            <Calendar className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                            {event.title}
                          </p>
                          <p className="text-xs text-zinc-400 truncate">
                            {event.location}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!isAdmin && (
              <>
                <Link to="/events" className="text-zinc-400 hover:text-white transition-colors">
                  Browse Events
                </Link>
                {user && (
                  <Link to="/bookings" className="text-zinc-400 hover:text-white transition-colors">
                    My Bookings
                  </Link>
                )}
              </>
            )}
            {isAdmin && !isAdminPage && (
              <Link to="/admin" className="text-zinc-400 hover:text-white transition-colors">
                Admin Panel
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 text-white hover:bg-white/10">
                    <User className="h-4 w-4" />
                    <span className="max-w-[120px] truncate">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {!isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/bookings" className="flex items-center gap-2 cursor-pointer">
                        <Ticket className="h-4 w-4" />
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && !isAdminPage && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-white hover:bg-white/10">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild className="glow">
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 bg-[#25140e] animate-fade-in">
            <div className="flex flex-col gap-3">
              {!isAdmin && (
                <>
                  <Link
                    to="/events"
                    className="px-3 py-2 text-zinc-400 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Browse Events
                  </Link>
                  {user && (
                    <Link
                      to="/bookings"
                      className="px-3 py-2 text-zinc-400 hover:text-white transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Bookings
                    </Link>
                  )}
                </>
              )}
              {isAdmin && !isAdminPage && (
                <Link
                  to="/admin"
                  className="px-3 py-2 text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <div className="border-t border-border/50 pt-3 mt-2">
                {user ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2 px-3">
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
