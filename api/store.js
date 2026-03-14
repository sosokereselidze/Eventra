/**
 * Database initialization for MongoDB.
 * Ensures the super-admin account and one default sample event exist.
 * All other events are managed via the Admin panel and live directly in MongoDB.
 */

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getCollections } from './db.js';

export async function initializeDatabase() {
  const { users, events } = getCollections();

  // Ensure the super-admin account always exists
  const admin = {
    id: 'super-admin-uuid',
    email: process.env.ADMIN_EMAIL || '',
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    name: process.env.ADMIN_NAME || 'Super Admin',
    isAdmin: true,
  };

  await users.updateOne(
    {
      $or: [
        { email: admin.email },
        { username: admin.username },
      ]
    },
    {
      $set: {
        passwordHash: bcrypt.hashSync(admin.password, 10),
        isAdmin: admin.isAdmin,
        name: admin.name,
        email: admin.email,
        username: admin.username,
      },
      $setOnInsert: {
        id: admin.id,
        created_at: new Date().toISOString(),
      }
    },
    { upsert: true }
  );

  console.log(`✓ Admin user synced: ${admin.username}`);

  // Seed one default sample event (only inserts if it doesn't already exist)
  const sampleEvent = {
    title: 'Grand Opening Night',
    description: 'Celebrate the launch of Eventra with live music, food, and exclusive prizes.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Eventra HQ, Tbilisi',
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
    tickets_available: 100,
    tickets_booked: 0,
    price: 0,
    category: 'Entertainment',
    featured: true,
  };

  await events.updateOne(
    { title: sampleEvent.title },
    {
      $set: { ...sampleEvent, updated_at: new Date().toISOString() },
      $setOnInsert: {
        id: uuidv4(),
        created_at: new Date().toISOString(),
      }
    },
    { upsert: true }
  );

  console.log('✓ Sample event synced: Grand Opening Night');
}

