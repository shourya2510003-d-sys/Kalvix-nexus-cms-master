require('dotenv').config({ path: '../frontend/.env.local' });
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch'); // Make sure to npm install node-fetch if using Node < 18

const BASE_API_URL = 'https://divinecardinal.vercel.app/api/backend';
const GALLERY_PATH = path.join(process.env.HOME || process.env.USERPROFILE, 'Downloads', 'dci');

async function uploadGalleryToRailway() {
  console.log("Starting gallery upload to Railway Backend...");
  
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
        const fileStream = fs.createReadStream(filePath);
        
        try {
          console.log(`  Uploading ${file}...`);
          const formData = new FormData();
          formData.append('file', fileStream);
          
          const uploadRes = await fetch(`${BASE_API_URL}/cms/upload`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
          });
          
          if (!uploadRes.ok) throw new Error(`Status ${uploadRes.status}`);
          const data = await uploadRes.json();
          uploadedUrls.push(data.url);
          console.log(`  Success: ${data.url}`);
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

uploadGalleryToRailway();
