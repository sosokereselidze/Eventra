import 'dotenv/config';
import { connectDB, getCollections } from './db.js';
import { initializeDatabase } from './store.js';

async function run() {
    try {
        console.log('Connecting to DB...');
        await connectDB();
        console.log('Re-initializing database to update images...');

        // We need to force update the images. Since initializeDatabase uses upsert, it should update them if we run it again.
        // However, initializeDatabase might have a check "if (eventCount > 0) return;" which we need to bypass or handle.
        // Let's check store.js content again... ah, I see I removed the "if count > 0 return" check in the previous turn. 
        // Wait, let's verify if I actually removed it or just modified it.
        // In step 31 diff, I replaced the block:
        // -  if (eventCount > 0) {
        // -    console.log('✓ Events already initialized');
        // -    return;
        // -  }
        // So the check IS gone or modified. But looking at the REPLACE content in step 77, it seems I just replaced the array.
        // Let's double check the current state of store.js to be sure.

        // Actually, I can just write a script that imports 'events' collection and updates them directly based on title if I wanted to be surgical, 
        // but calling initializeDatabase is easier if it works.
        // Let's try calling initializeDatabase.

        await initializeDatabase();
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

run();
