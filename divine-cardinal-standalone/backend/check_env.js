require('dotenv').config({ path: '../frontend/.env.local' });
console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
console.log("Keys in process.env:", Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('URL') || k.includes('API') || k.includes('FIREBASE')));
