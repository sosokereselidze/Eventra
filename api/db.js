import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventflow';
const client = new MongoClient(uri);

let db = null;
let usersCollection = null;
let eventsCollection = null;
let bookingsCollection = null;

export async function connectDB() {
    if (db) return db;
    try {
        await client.connect();
        console.log('✓ Connected to MongoDB');


        db = client.db('eventra_db');
        usersCollection = db.collection('users');
        eventsCollection = db.collection('events');
        bookingsCollection = db.collection('bookings');

        // Create indexes for better performance
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        await usersCollection.createIndex({ username: 1 }, { unique: true, sparse: true });
        await eventsCollection.createIndex({ date: 1 });
        await eventsCollection.createIndex({ featured: 1 });
        await bookingsCollection.createIndex({ user_id: 1 });
        await bookingsCollection.createIndex({ event_id: 1 });

        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

export function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB() first.');
    }
    return db;
}

export function getCollections() {
    if (!usersCollection || !eventsCollection || !bookingsCollection) {
        throw new Error('Collections not initialized. Call connectDB() first.');
    }
    return {
        users: usersCollection,
        events: eventsCollection,
        bookings: bookingsCollection,
    };
}

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await client.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
    }
});
