import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { fetchApi, getApiUrl } from '@/lib/api';
import { Users, Calendar, TrendingUp, DollarSign, Activity, BarChart3, PieChart as PieChartIcon, ArrowUpRight, LayoutDashboard, Ticket, Plus, Pencil, Trash, MapPin, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useAuth } from '@/lib/auth';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const CATEGORIES = [
  "Music",
  "Conference",
  "Workshop",
  "Sports",
  "Technology",
  "Art",
  "Networking",
  "Entertainment",
  "Health",
  "Education",
  "Other"
];

interface Analytics {
  totalUsers: number;
  totalEvents: number;
  totalBookings: number;
  totalRevenue: number;
  revenueOverTime: { name: string; total: number }[];
  categoryStats: { name: string; value: number }[];
  recentActivity: any[];
}

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  username: string;
  isAdmin: boolean;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  tickets_available: number;
  tickets_booked: number;
  category: string;
  image_url: string;
  featured: boolean;
  created_at: string;
}

interface Booking {
  id: string;
  user_id: string;
  event_id: string;
  quantity: number;
  created_at: string;
  user: { name: string; email: string };
  event: { title: string; price: number };
}

const DEFAULT_FORM = {
  title: '',
  description: '',
  date: '',
  location: '',
  price: 0,
  tickets_available: 100,
  category: '',
  image_url: '',
  featured: false
};

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'bookings' | 'events'>('dashboard');

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [usersPage, setUsersPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);

  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
  const [eventsTotalPages, setEventsTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);

  // Event Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isaccessing, setIsAccessing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await fetchApi<Analytics>('/api/admin/analytics');
        setAnalytics(data);
      } catch (error) {
        toast({ title: 'Error loading analytics', variant: 'destructive' });
      }
    };
    loadDashboard();
  }, [toast]);
  // Lazy load tab data
  useEffect(() => {
    if (activeTab === 'users') {
      setLoading(true);
      fetchApi<any>(`/api/admin/users?page=${usersPage}&limit=20`)
        .then(data => {
          setUsers(Array.isArray(data?.users) ? data.users : []);
          setUsersTotalPages(data?.totalPages || 1);
        })
        .catch(() => toast({ title: 'Error loading users', variant: 'destructive' }))
        .finally(() => setLoading(false));
    }
    if (activeTab === 'bookings') {
      setLoading(true);
      fetchApi<any>(`/api/admin/bookings?page=${bookingsPage}&limit=20`)
        .then(data => {
          setBookings(Array.isArray(data?.bookings) ? data.bookings : []);
          setBookingsTotalPages(data?.totalPages || 1);
        })
        .catch(() => toast({ title: 'Error loading bookings', variant: 'destructive' }))
        .finally(() => setLoading(false));
    }
    if (activeTab === 'events') {
      setLoading(true);
      fetchApi<any>(`/api/events?page=${eventsPage}&limit=20`)
        .then((data) => {
          setEvents(Array.isArray(data?.events) ? data.events : []);
          setEventsTotalPages(data?.totalPages || 1);
        })
        .catch(() => toast({ title: 'Error loading events', variant: 'destructive' }))
        .finally(() => setLoading(false));
    }
  }, [activeTab, usersPage, bookingsPage, eventsPage, toast]);

  const handleRoleUpdate = async (userId: string, newStatus: boolean) => {
    try {
      await fetchApi(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ isAdmin: newStatus })
      });

      toast({ title: `User role updated`, description: `User is now ${newStatus ? 'an Admin' : 'a regular User'}` });

      const data = await fetchApi<any>(`/api/admin/users?page=${usersPage}&limit=20`);
      if (data && data.users) {
        setUsers(data.users);
        setUsersTotalPages(data.totalPages);
      }
    } catch (error) {
      toast({ title: 'Failed to update role', description: 'Only Super Admin can do this', variant: 'destructive' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('eventflow_token');
      const res = await fetch(getApiUrl('/api/admin/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await res.json();
      setFormData(prev => ({ ...prev, image_url: data.url }));
      toast({ title: 'Image uploaded successfully' });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Check server connection',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEvent = async () => {
    try {
      if (!formData.title || !formData.date || !formData.price) {
        return toast({ title: 'Please fill in required fields', variant: 'destructive' });
      }

      const payload = {
        ...formData,
        // Ensure number types
        price: Number(formData.price),
        tickets_available: Number(formData.tickets_available)
      };

      if (currentEvent) {
        // Update
        await fetchApi(`/api/events/${currentEvent.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        toast({ title: 'Event updated' });
      } else {
        // Create
        await fetchApi('/api/events', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        toast({ title: 'Event created' });
      }

      setIsDialogOpen(false);
      // Reload events
      const data = await fetchApi<any>(`/api/events?page=${eventsPage}&limit=20`);
      if (data && data.events) {
        setEvents(data.events);
        setEventsTotalPages(data.totalPages);
      }
    } catch (error) {
      toast({ title: 'Failed to save event', variant: 'destructive' });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await fetchApi(`/api/events/${id}`, { method: 'DELETE' });
      toast({ title: 'Event deleted' });
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const openAddDialog = () => {
    setCurrentEvent(null);
    setFormData(DEFAULT_FORM);
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: Event) => {
    setCurrentEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.split('T')[0], // Simple date format for input
      location: event.location,
      price: event.price,
      tickets_available: event.tickets_available,
      category: event.category,
      image_url: event.image_url,
      featured: event.featured
    });
    setIsDialogOpen(true);
  };

  const isSuperAdmin = user?.username === 'sosokereselidze0';
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-12 relative z-10">
        <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3 tracking-tight">
              Admin <span className="gradient-text">Portal</span>
            </h1>
            <p className="text-lg text-muted-foreground flex items-center gap-2">
              Manage your platform, users, and performance.
            </p>
          </div>

          {/* Custom Tabs Navigation */}
          <div className="flex p-1 bg-secondary/30 backdrop-blur-md rounded-xl border border-border/50">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'events', label: 'Events', icon: Calendar }, // Added Events Tab
              { id: 'users', label: 'Users', icon: Users },
              { id: 'bookings', label: 'Bookings', icon: Ticket },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}
                `}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="animate-fade-in space-y-4">
            <div className="flex justify-end">
              <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add New Event
              </Button>
            </div>

            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Event Management</CardTitle>
                <CardDescription>Create and manage your events.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/30 text-muted-foreground uppercase text-xs font-bold">
                      <tr>
                        <th className="px-6 py-4 rounded-tl-lg">Image</th>
                        <th className="px-6 py-4">Event Details</th>
                        <th className="px-6 py-4">Date & Location</th>
                        <th className="px-6 py-4">Stats</th>
                        <th className="px-6 py-4 rounded-tr-lg text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {events?.map((e) => (
                        <tr key={e.id} className="hover:bg-secondary/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="h-12 w-16 rounded overflow-hidden bg-muted relative">
                              {e.image_url ? (
                                <img src={e.image_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full w-full">
                                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-foreground">{e.title}</div>
                            <div className="text-muted-foreground text-xs line-clamp-1 max-w-[200px]">{e.description}</div>
                            <div className="mt-1 flex gap-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{e.category}</span>
                              {e.featured && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">Featured</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar className="h-3 w-3" /> {new Date(e.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 text-xs mt-1">
                              <MapPin className="h-3 w-3" /> {e.location}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <div className="text-foreground font-medium">${e.price}</div>
                            <div className="text-muted-foreground">{e.tickets_booked} / {e.tickets_available} booked</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEditDialog(e)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteEvent(e.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {eventsTotalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEventsPage(p => Math.max(1, p - 1))}
                      disabled={eventsPage === 1 || loading}
                      className="h-8 w-8 rounded-full"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">Page {eventsPage} of {eventsTotalPages}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEventsPage(p => Math.min(eventsTotalPages, p + 1))}
                      disabled={eventsPage === eventsTotalPages || loading}
                      className="h-8 w-8 rounded-full"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* CUSTOM MODAL FOR EVENTS */}
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold">{currentEvent ? 'Edit Event' : 'Create New Event'}</h2>
                <p className="text-sm text-muted-foreground">{currentEvent ? 'Modifying existing event details.' : 'Add a new event to the platform.'}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">Image</Label>
                  <div className="col-span-3">
                    <Input id="image" type="file" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
                    {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
                    {formData.image_url && <div className="mt-2 h-20 w-32 rounded bg-muted overflow-hidden"><img src={formData.image_url} className="w-full h-full object-cover" /></div>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="desc" className="text-right">Description</Label>
                  <Input id="desc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Date</Label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="loc" className="text-right">Location</Label>
                  <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Price ($)</Label>
                  <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tickets" className="text-right">Tickets</Label>
                  <Input type="number" value={formData.tickets_available} onChange={(e) => setFormData({ ...formData, tickets_available: Number(e.target.value) })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cat" className="text-right">Category</Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="cat">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveEvent} disabled={uploading} className="bg-primary">
                  {uploading ? 'Uploading...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {
          activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: 'Total Users',
                    value: analytics.totalUsers,
                    icon: Users,
                    color: 'text-blue-500',
                    bg: 'bg-blue-500/10',
                    trend: 'Active accounts'
                  },
                  {
                    label: 'Active Events',
                    value: analytics.totalEvents,
                    icon: Calendar,
                    color: 'text-purple-500',
                    bg: 'bg-purple-500/10',
                    trend: 'Currently listed'
                  },
                  {
                    label: 'Total Bookings',
                    value: analytics.totalBookings,
                    icon: TrendingUp,
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500/10',
                    trend: 'All time'
                  },
                  {
                    label: 'Total Revenue',
                    value: `$${(analytics.totalRevenue || 0).toLocaleString()}`,
                    icon: DollarSign,
                    color: 'text-amber-500',
                    bg: 'bg-amber-500/10',
                    trend: 'Lifetime earnings'
                  },
                ].map((stat, i) => (
                  <Card key={i} className="border-border/50 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-colors group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                      <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                        {stat.trend}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <Card className="lg:col-span-2 border-border/50 bg-card/40 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Revenue Overview
                    </CardTitle>
                    <CardDescription>Monthly revenue performance.</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-0">
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.revenueOverTime || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                          <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Categories Chart */}
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-primary" />
                      Event Categories
                    </CardTitle>
                    <CardDescription>Distribution of events.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={analytics.categoryStats || []} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                            {analytics.categoryStats?.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold">{analytics.totalEvents}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Events</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {analytics.categoryStats?.slice(0, 4).map((cat, i) => (
                        <div key={i} className="flex flex-col p-2 rounded-lg bg-secondary/20 border border-white/5">
                          <span className="text-xs font-medium text-foreground truncate">{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              {analytics.recentActivity && analytics.recentActivity.length > 0 && (
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-emerald-400" /> Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.recentActivity.map((booking, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                              <Ticket className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium line-clamp-1">{booking.event_title}</p>
                              <p className="text-xs text-muted-foreground">{new Date(booking.created_at).toLocaleDateString()} • Qty: {booking.quantity}</p>
                            </div>
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">#{booking.id.substring(0, 6)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )
        }

        {/* USERS TAB */}
        {
          activeTab === 'users' && (
            <div className="animate-fade-in">
              <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage registered users.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-secondary/30 text-muted-foreground uppercase text-xs font-bold">
                        <tr>
                          <th className="px-6 py-4 rounded-tl-lg">User</th>
                          <th className="px-6 py-4">Username</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Joined</th>
                          {isSuperAdmin && <th className="px-6 py-4 rounded-tr-lg text-right">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {users?.map((u) => (
                          <tr key={u.id} className="hover:bg-secondary/10 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">{u.name}</div>
                                  <div className="text-muted-foreground text-xs">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">{u.username}</td>
                            <td className="px-6 py-4">
                              {u.username === 'sosokereselidze0' ? (
                                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">Super Admin</span>
                              ) : u.isAdmin ? (
                                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-bold">Admin</span>
                              ) : (
                                <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs">User</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                            {isSuperAdmin && (
                              <td className="px-6 py-4 text-right">
                                {u.username !== 'sosokereselidze0' && (
                                  u.isAdmin ? (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-7 text-xs"
                                      onClick={() => handleRoleUpdate(u.id, false)}
                                    >
                                      Revoke Admin
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs border-primary text-primary hover:bg-primary/10"
                                      onClick={() => handleRoleUpdate(u.id, true)}
                                    >
                                      Make Admin
                                    </Button>
                                  )
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {usersTotalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                        disabled={usersPage === 1 || loading}
                        className="h-8 w-8 rounded-full"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">Page {usersPage} of {usersTotalPages}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setUsersPage(p => Math.min(usersTotalPages, p + 1))}
                        disabled={usersPage === usersTotalPages || loading}
                        className="h-8 w-8 rounded-full"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        }

        {/* BOOKINGS TAB */}
        {
          activeTab === 'bookings' && (
            <div className="animate-fade-in">
              <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Booking History</CardTitle>
                  <CardDescription>Detailed transaction log of all bookings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-secondary/30 text-muted-foreground uppercase text-xs font-bold">
                        <tr>
                          <th className="px-6 py-4 rounded-tl-lg">Event</th>
                          <th className="px-6 py-4">Booked By</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Qty</th>
                          <th className="px-6 py-4 rounded-tr-lg text-right">Total Paid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {bookings?.map((b) => (
                          <tr key={b.id} className="hover:bg-secondary/10 transition-colors">
                            <td className="px-6 py-4 font-medium text-foreground">{b.event.title}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-foreground">{b.user.name}</span>
                                <span className="text-xs text-muted-foreground">{b.user.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">{new Date(b.created_at).toLocaleDateString()} {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="px-6 py-4 text-foreground">{b.quantity}</td>
                            <td className="px-6 py-4 text-right font-medium text-emerald-400">
                              ${(b.event.price * b.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {bookingsTotalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setBookingsPage(p => Math.max(1, p - 1))}
                        disabled={bookingsPage === 1 || loading}
                        className="h-8 w-8 rounded-full"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">Page {bookingsPage} of {bookingsTotalPages}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setBookingsPage(p => Math.min(bookingsTotalPages, p + 1))}
                        disabled={bookingsPage === bookingsTotalPages || loading}
                        className="h-8 w-8 rounded-full"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        }

      </main >
    </div >
  );
}
