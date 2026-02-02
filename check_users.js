import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017/eventflow';
const client = new MongoClient(uri);

async function check() {
    try {
        await client.connect();
        const db = client.db();
        const users = db.collection('users');
        const allUsers = await users.find({}).project({ passwordHash: 0 }).toArray();
        console.log('Users in DB:', allUsers);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

check();
