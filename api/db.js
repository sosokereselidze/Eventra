import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventflow';

let cachedConnection = null;

export async function connectDB() {
    if (cachedConnection) {
        return cachedConnection;
    }

    if (!uri) {
        throw new Error('MONGODB_URI is not defined');
    }

    try {
        const opts = {
            bufferCommands: false,
        };
        await mongoose.connect(uri, opts);
        cachedConnection = mongoose.connection.db;
        console.log('✓ Connected to MongoDB via Mongoose');
        return cachedConnection;
    } catch (error) {
        console.error('Mongoose connection error:', error);
        throw error;
    }
}

export function getDB() {
    return mongoose.connection.db;
}

export function getCollections() {
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error('Database connection not established. Call connectDB() first.');
    }
    return {
        users: db.collection('users'),
        events: db.collection('events'),
        bookings: db.collection('bookings'),
    };
}

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('Mongoose connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error closing Mongoose connection:', error);
        process.exit(1);
    }
});
