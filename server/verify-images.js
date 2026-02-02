
const events = await fetch('http://localhost:3001/api/events').then(res => res.json());
console.log('Total events:', events.length);
console.log('First 5 image URLs:');
events.slice(0, 5).forEach(e => console.log(e.title, ':', e.image_url));
