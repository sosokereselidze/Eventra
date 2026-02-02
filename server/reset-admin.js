import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventflow';

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        const users = db.collection('users');

        const hashedPassword = bcrypt.hashSync('admin0', 10);

        const result = await users.updateOne(
            { username: 'sosokereselidze0' },
            {
                $set: {
                    passwordHash: hashedPassword,
                    isAdmin: true,
                    email: 'sosokereselidze0@example.com',
                    name: 'Sosok'
                },
                $setOnInsert: {
                    id: uuidv4(),
                    created_at: new Date().toISOString()
                }
            },
            { upsert: true }
        );
        console.log('Admin password reset successfully:', result);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
run();
