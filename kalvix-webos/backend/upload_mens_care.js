const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'qdq7ult5', 
  api_key: '677224231391214', 
  api_secret: 'xxxeSIdBn8CVDZ_bZvq2PfYCo8Q' 
});

const FOLDERS = [
  '/Users/apple/Downloads/Amazon Image Gallery/Mens Care Amazon/DCIM02',
  '/Users/apple/Downloads/Amazon Image Gallery/Mens Care Amazon/DCIM05',
  '/Users/apple/Downloads/Amazon Image Gallery/Mens Care Amazon/DCIM07'
];
const API_URL = 'https://kalvix-nexus-production.up.railway.app/api';

function getSkuFromFileName(file) {
  const clean = file.replace(/DClM/ig, 'DCIM'); // fix lowercase L typo
  
  // Match special patterns like DCIM0.3 -> DCIM03
  if (clean.includes('DCIM0.3')) {
    return 'DCIM03';
  }
  
  // Match direct SKU patterns like DCIM01, DCIM02, DCIM05, DCIM07, etc.
  const directMatch = clean.match(/DCIM\d+/i);
  if (directMatch) {
    const digitsMatch = directMatch[0].match(/\d+/);
    if (digitsMatch) {
      return `DCIM${digitsMatch[0].padStart(2, '0')}`;
    }
  }
  
  // Match specific video names
  if (clean.toLowerCase().includes('juniper berry')) {
    return 'DCIM01';
  }
  if (clean.toLowerCase().includes('almond shaving')) {
    return 'DCIM05';
  }
  if (clean.toLowerCase().includes('sandalwood beard')) {
    return 'DCIM07';
  }
  
  return null;
}

async function main() {
  const skuGroups = {};

  for (const folder of FOLDERS) {
    console.log(`Scanning folder: ${folder}...`);
    if (!fs.existsSync(folder)) {
      console.warn(`  Warning: Folder does not exist: ${folder}`);
      continue;
    }

    const files = fs.readdirSync(folder);
    files.forEach(file => {
      if (file.startsWith('._')) return; // Ignore macOS metadata files
      
      const sku = getSkuFromFileName(file);
      if (sku) {
        if (!skuGroups[sku]) {
          skuGroups[sku] = [];
        }
        skuGroups[sku].push({ file, folder });
      } else {
        console.log(`  Could not parse SKU for file: ${file}`);
      }
    });
  }

  const skus = Object.keys(skuGroups);
  console.log(`\nFound ${skus.length} SKUs to process:`, skus);

  const payload = [];

  for (const sku of skus) {
    console.log(`\nProcessing files for SKU ${sku}...`);
    const urls = [];
    
    // Sort files so that the .1.png or primary ones come first
    const sortedItems = skuGroups[sku].sort((a, b) => {
      const aName = a.file.toLowerCase();
      const bName = b.file.toLowerCase();
      if (aName.includes('mp4') && !bName.includes('mp4')) return 1; // push videos to the end
      if (!aName.includes('mp4') && bName.includes('mp4')) return -1;
      return aName.localeCompare(bName);
    });

    for (const item of sortedItems) {
      const filePath = path.join(item.folder, item.file);
      console.log(`  Uploading: ${item.file}...`);
      
      try {
        const ext = path.extname(filePath).toLowerCase();
        const uploadOptions = {
          folder: `kalvix_nexus/products/${sku}`,
          resource_type: 'auto'
        };
        
        // Auto convert images to jpg to compress them, except videos
        if (['.tif', '.tiff', '.bmp', '.png', '.jpeg', '.jpg', '.webp'].includes(ext)) {
          uploadOptions.format = 'jpg';
        }
        
        const result = await cloudinary.uploader.upload(filePath, uploadOptions);
        urls.push(result.secure_url);
        console.log(`    Success: ${result.secure_url}`);
      } catch (err) {
        console.error(`    Failed to upload ${item.file}:`, err.message || err);
      }
    }

    if (urls.length > 0) {
      payload.push({ sku, urls });
    }
  }

  console.log(`\nFinished uploading. Pushing mappings for ${payload.length} SKUs to Railway...`);
  
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
  }
}

main().catch(console.error);
