require('dotenv').config({ path: '../frontend/.env.local' });
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const BASE_API_URL = 'https://divinecardinal.vercel.app/api/backend';
const GALLERY_PATH = path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads', 'dci');

async function uploadGallery() {
  console.log("Starting gallery upload...");
  
  if (!fs.existsSync(GALLERY_PATH)) {
    console.error(`Gallery folder not found at: ${GALLERY_PATH}`);
    process.exit(1);
  }

  const payload = [];

  const categories = fs.readdirSync(GALLERY_PATH).filter(f => fs.statSync(path.join(GALLERY_PATH, f)).isDirectory());
  
  for (const cat of categories) {
    const catPath = path.join(GALLERY_PATH, cat);
    const skus = fs.readdirSync(catPath).filter(f => fs.statSync(path.join(catPath, f)).isDirectory());
    
    for (const sku of skus) {
      console.log(`Processing SKU: ${sku}...`);
      const skuPath = path.join(catPath, sku);
      const files = fs.readdirSync(skuPath).filter(f => f.match(/\.(png|jpe?g|webp|mp4)$/i));
      
      const uploadedUrls = [];
      
      for (const file of files) {
        const filePath = path.join(skuPath, file);
        const fileBuffer = fs.readFileSync(filePath);
        const mimeType = file.endsWith('.mp4') ? 'video/mp4' : (file.endsWith('.png') ? 'image/png' : 'image/jpeg');
        
        try {
          const storageRef = ref(storage, `products/${sku}/${file}`);
          console.log(`  Uploading ${file}...`);
          await uploadBytes(storageRef, fileBuffer, { contentType: mimeType });
          const url = await getDownloadURL(storageRef);
          uploadedUrls.push(url);
          console.log(`  Success: ${url}`);
        } catch (err) {
          console.error(`  Failed to upload ${file}:`, err.message);
        }
      }
      
      if (uploadedUrls.length > 0) {
        payload.push({ sku, urls: uploadedUrls });
      }
    }
  }

  console.log(`Finished uploading. Found ${payload.length} SKUs to update.`);
  if (payload.length > 0) {
    console.log("Sending bulk update to the server...");
    try {
      const res = await fetch(`${BASE_API_URL}/admin/products/bulk-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log("Server Response:", data);
    } catch (err) {
      console.error("Failed to update database:", err);
    }
  }
}

uploadGallery();
