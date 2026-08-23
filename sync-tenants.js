require('dotenv').config({ path: '/opt/app/frontend/.env.local' });
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
});

const db = admin.database();
const tenantsRef = db.ref('tenants');

tenantsRef.once('value').then(snapshot => {
  const tenants = snapshot.val();
  if (!tenants) return console.log('No tenants found.');
  
  const updates = {};
  for (const [subdomain, data] of Object.entries(tenants)) {
    if (data.ownerUid) {
      data.subdomain = subdomain;
      updates[`users/${data.ownerUid}/stores/${subdomain}`] = data;
    }
  }
  
  return db.ref().update(updates);
}).then(() => {
  console.log('Synced successfully!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
