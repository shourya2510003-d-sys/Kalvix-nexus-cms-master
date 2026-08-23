const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'qdq7ult5', 
  api_key: '677224231391214', 
  api_secret: 'xxxeSIdBn8CVDZ_bZvq2PfYCo8Q' 
});

const DIR_PATH = '/Users/apple/Downloads/Shourya DCI DATA/CATEGORY WITH INGREDIENTS/mothercare';
const API_URL = 'https://kalvix-nexus-production.up.railway.app/api';

async function main() {
  console.log(`Scanning directory: ${DIR_PATH}`);
  
  if (!fs.existsSync(DIR_PATH)) {
    console.error(`Error: Directory does not exist at ${DIR_PATH}`);
    process.exit(1);
  }

  const files = fs.readdirSync(DIR_PATH);
  const skuGroups = {};

  files.forEach(file => {
    // Ignore macOS hidden metadata files
    if (file.startsWith('._')) return;
    
    // Match SKU pattern e.g., DCIMC01, DCIMC02, etc.
    const match = file.match(/DCIMC\d+/i);
    if (match) {
      const sku = match[0].toUpperCase();
      if (!skuGroups[sku]) {
        skuGroups[sku] = [];
      }
      skuGroups[sku].push(file);
    }
  });

  const skus = Object.keys(skuGroups);
  console.log(`Found ${skus.length} SKUs:`, skus);

  const payload = [];

  for (const sku of skus) {
    console.log(`\nUploading files for SKU ${sku}...`);
    const urls = [];
    
    for (const file of skuGroups[sku]) {
      const filePath = path.join(DIR_PATH, file);
      console.log(`  Uploading file: ${file}...`);
      
      try {
        const ext = path.extname(filePath).toLowerCase();
        const uploadOptions = {
          folder: `kalvix_nexus/products/${sku}`,
          resource_type: 'auto'
        };
        if (['.tif', '.tiff', '.bmp', '.png', '.jpeg', '.jpg', '.webp'].includes(ext)) {
          uploadOptions.format = 'jpg';
        }
        
        const result = await cloudinary.uploader.upload(filePath, uploadOptions);
        
        urls.push(result.secure_url);
        console.log(`    Uploaded successfully: ${result.secure_url}`);
      } catch (error) {
        console.error(`    Failed to upload ${file}:`, error.message || error);
      }
    }

    if (urls.length > 0) {
      payload.push({ sku, urls });
    }
  }

  console.log(`\nFinished uploading. Pushing image mappings for ${payload.length} SKUs to Railway...`);
  
  if (payload.length > 0) {
    try {
      const res = await fetch(`${API_URL}/admin/products/bulk-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Railway Response:", data);
        console.log("Successfully updated product images in DB.");
      } else {
        const errorText = await res.text();
        console.error(`Failed to update DB on Railway. Status ${res.status}:`, errorText);
      }
    } catch (err) {
      console.error("Network error updating database on Railway:", err);
    }
  } else {
    console.log("No images were successfully uploaded.");
  }
}

main().catch(console.error);
