/**
 * Database initialization and seeding for MongoDB.
 */

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getCollections } from './db.js';

export async function initializeDatabase() {
  const { users, events, bookings } = getCollections();

  // Ensure Admin users exist using upsert logic
  const admins = [
    {
      id: 'admin-uuid',
      email: 'admin@example.com',
      username: 'admin',
      password: 'admin123',
      name: 'Admin',
      isAdmin: true
    },
    {
      id: 'sosok-admin-uuid',
      email: 'sosokereselidze0@example.com',
      username: 'sosokereselidze0',
      password: 'admin0',
      name: 'Sosok',
      isAdmin: true
    }
  ];

  for (const admin of admins) {
    await users.updateOne(
      {
        $or: [
          { email: admin.email },
          { username: admin.username }
        ]
      },
      {
        $set: {
          passwordHash: bcrypt.hashSync(admin.password, 10),
          isAdmin: admin.isAdmin,
          name: admin.name,
          email: admin.email, // Ensure email/username match the config
          username: admin.username
        },
        $setOnInsert: {
          id: admin.id,
          created_at: new Date().toISOString(),
        }
      },
      { upsert: true }
    );
    console.log(`✓ Admin user ${admin.email}/${admin.username} synced`);
  }

  // Check if events are already seeded
  const eventCount = await events.countDocuments();

  // Define 15 new events + original 5 (renamed/kept) with FIXED reliable images
  const allSeedEvents = [
    // Original 5
    {
      title: 'Summer Music Festival 2025',
      description: 'The biggest outdoor music festival of the year. Three days of live performances.',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Central Park, New York',
      image_url: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&w=800', // Concert crowd
      tickets_available: 5000,
      tickets_booked: 1200,
      price: 149,
      category: 'Music',
      featured: true,
    },
    {
      title: 'Tech Innovators Conference',
      description: 'Join industry leaders for keynotes, workshops, and networking.',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Convention Center, San Francisco',
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800', // Tech conference
      tickets_available: 800,
      tickets_booked: 340,
      price: 299,
      category: 'Technology',
      featured: true,
    },
    {
      title: 'Food & Wine Tasting Night',
      description: 'An evening of gourmet bites and fine wines from local vendors.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Downtown Loft, Chicago',
      image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800', // Wine and food
      tickets_available: 120,
      tickets_booked: 85,
      price: 79,
      category: 'Food & Drink',
      featured: false,
    },
    {
      title: 'Marathon Challenge 2025',
      description: 'Annual marathon through the city. Half and full marathon options.',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'City Center, Boston',
      image_url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800', // Runner
      tickets_available: 10000,
      tickets_booked: 4200,
      price: 55,
      category: 'Sports',
      featured: true,
    },
    {
      title: 'Art Gallery Opening',
      description: 'Exhibition of contemporary local artists. Wine and light refreshments.',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Modern Art Space, Seattle',
      image_url: 'https://images.unsplash.com/photo-1518998053901-5348d3969105?auto=format&fit=crop&w=800', // Art gallery
      tickets_available: 80,
      tickets_booked: 45,
      price: 25,
      category: 'Art',
      featured: false,
    },
    // New 15 Events
    {
      title: 'Global AI Summit',
      description: 'Deep dive into artificial intelligence and machine learning with top experts.',
      date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Silicon Valley, CA',
      image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800', // Robot/AI
      tickets_available: 500,
      tickets_booked: 150,
      price: 399,
      category: 'Technology',
      featured: true,
    },
    {
      title: 'Jazz Under the Stars',
      description: 'A magical night of smooth jazz in the open air.',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Botanical Gardens, Atlanta',
      image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800', // Jazz
      tickets_available: 300,
      tickets_booked: 120,
      price: 65,
      category: 'Music',
      featured: false,
    },
    {
      title: 'Startup Pitch Night',
      description: 'Watch 10 promising startups pitch to top VCs.',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Innovation Hub, Austin',
      image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800', // Meeting
      tickets_available: 100,
      tickets_booked: 90,
      price: 20,
      category: 'Business',
      featured: true,
    },
    {
      title: 'Yoga Retreat Weekend',
      description: 'Reset your mind and body with a 2-day yoga retreat.',
      date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Blue Ridge Mountains, NC',
      image_url: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&w=800', // Yoga
      tickets_available: 50,
      tickets_booked: 10,
      price: 250,
      category: 'Health',
      featured: false,
    },
    {
      title: 'Crypto & Web3 Expo',
      description: 'Explore the future of decentralized finance and internet.',
      date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Convention Center, Miami',
      image_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=800', // Blockchain/Tech
      tickets_available: 2000,
      tickets_booked: 1500,
      price: 199,
      category: 'Technology',
      featured: true,
    },
    {
      title: 'Gourmet Cheese Masterclass',
      description: 'Learn to pair cheese with wine like a pro.',
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Culinary School, Paris',
      image_url: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=800', // Cheese
      tickets_available: 20,
      tickets_booked: 5,
      price: 120,
      category: 'Food & Drink',
      featured: false,
    },
    {
      title: 'Indie Film Festival',
      description: 'Screening of independent films from around the globe.',
      date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'The Grand Cinema, Toronto',
      image_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800', // Movie/Cinema
      tickets_available: 400,
      tickets_booked: 200,
      price: 45,
      category: 'Art',
      featured: true,
    },
    {
      title: 'Coding Bootcamp for Beginners',
      description: 'Intensive one-day workshop to learn Python.',
      date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Tech Hub, London',
      image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800', // Coding
      tickets_available: 30,
      tickets_booked: 25,
      price: 99,
      category: 'Education',
      featured: false,
    },
    {
      title: 'Charity Charity Gala',
      description: 'Black tie event to raise funds for local schools.',
      date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Grand Hotel, Chicago',
      image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800', // Gala
      tickets_available: 300,
      tickets_booked: 50,
      price: 500,
      category: 'Community',
      featured: true,
    },
    {
      title: 'Rock Legends Concert',
      description: 'Tribute band playing the greatest hits of the 80s.',
      date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Stadium Arena, Los Angeles',
      image_url: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=800', // Rock concert
      tickets_available: 15000,
      tickets_booked: 12000,
      price: 89,
      category: 'Music',
      featured: true,
    },
    {
      title: 'Modern Architecture Walk',
      description: 'Guided tour of the city\'s most iconic modern buildings.',
      date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Downtown, Chicago',
      image_url: 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=800', // Architecture
      tickets_available: 25,
      tickets_booked: 10,
      price: 40,
      category: 'Art',
      featured: false,
    },
    {
      title: 'Digital Marketing Strategy Workshop',
      description: 'Boost your business with the latest digital marketing trends.',
      date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Business Center, New York',
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800', // Marketing
      tickets_available: 60,
      tickets_booked: 30,
      price: 150,
      category: 'Business',
      featured: false,
    },
    {
      title: 'Vegan Food Festival',
      description: 'Delicious plant-based foods from top chefs.',
      date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Riverfront Park, Portland',
      image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800', // Salad/Food
      tickets_available: 2000,
      tickets_booked: 800,
      price: 35,
      category: 'Food & Drink',
      featured: true,
    },
    {
      title: 'Stand-up Comedy Night',
      description: 'Laugh out loud with the funniest local comedians.',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Comedy Club, Denver',
      image_url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800', // Microphone
      tickets_available: 150,
      tickets_booked: 140,
      price: 30,
      category: 'Entertainment',
      featured: false,
    },
    {
      title: 'Photography Masterclass',
      description: 'Learn composition and lighting from pro photographers.',
      date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Studio 54, Nashville',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800', // Camera
      tickets_available: 15,
      tickets_booked: 5,
      price: 200,
      category: 'Art',
      featured: false,
    },
  ];

  console.log('Seeding events...');

  for (const event of allSeedEvents) {
    await events.updateOne(
      { title: event.title },
      {
        $set: {
          ...event,
          updated_at: new Date().toISOString(),
        },
        $setOnInsert: {
          id: uuidv4(),
          created_at: new Date().toISOString(),
        }
      },
      { upsert: true }
    );
  }

  console.log('✓ Database events seeded/updated successfully');
}
