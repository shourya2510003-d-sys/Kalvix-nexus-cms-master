require('dotenv').config({ path: './frontend/.env.local' });
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function listTenants() {
  const snapshot = await db.collection('tenants').get();
  console.log("Tenants in DB:");
  snapshot.forEach(doc => {
    console.log(doc.id, "=>", doc.data().storeName);
  });
  process.exit(0);
}

listTenants().catch(console.error);
