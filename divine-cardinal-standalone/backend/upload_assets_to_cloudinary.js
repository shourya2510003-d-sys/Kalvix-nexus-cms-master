const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'qdq7ult5', 
  api_key: '677224231391214', 
  api_secret: 'xxxeSIdBn8CVDZ_bZvq2PfYCo8Q' 
});

const TARGET_DIR = '/Users/apple/Documents/Kalvix Nexus Dealing Projects/divine cardinal/';
const INGREDIENTS_DIR = path.join(TARGET_DIR, 'ingredients ');

async function uploadFile(filePath, folderName) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folderName,
      use_filename: true,
      unique_filename: false
    });
    return result.secure_url;
  } catch (err) {
    console.error(`Error uploading ${filePath}:`, err.message || err);
    return null;
  }
}

async function main() {
  console.log('--- Uploading assets to Cloudinary ---');

  // 1. Upload Navbar menu images
  const menuFiles = [
    { file: 'attar menu.jpg', key: 'attar-and-toners' },
    { file: 'child care menu.png', key: 'baby-care-range' },
    { file: 'face care menu.png', key: 'face-and-body' },
    { file: 'hair care menu.png', key: 'hair-care' },
    { file: 'mens carrer menu.png', key: 'men-care' }, // Note typo in name
    { file: 'mother care menu.png', key: 'mother-care' },
    { file: 'women care menu.png', key: 'womens-care' },
    { file: 'wellness menu.png', key: 'wellness-category' }
  ];

  const menuUrls = {};
  for (const item of menuFiles) {
    const filePath = path.join(TARGET_DIR, item.file);
    if (fs.existsSync(filePath)) {
      console.log(`Uploading navbar menu: ${item.file}...`);
      const url = await uploadFile(filePath, 'kalvix_nexus/navbar');
      if (url) {
        menuUrls[item.key] = url;
      }
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  }

  // 2. Upload Ingredients images
  const ingredientUrls = {};
  if (fs.existsSync(INGREDIENTS_DIR)) {
    const files = fs.readdirSync(INGREDIENTS_DIR).filter(f => f.match(/\.(png|jpe?g|webp)$/i));
    for (const file of files) {
      const filePath = path.join(INGREDIENTS_DIR, file);
      console.log(`Uploading ingredient: ${file}...`);
      const url = await uploadFile(filePath, 'kalvix_nexus/ingredients');
      if (url) {
        const nameKey = path.parse(file).name.toLowerCase().replace(/\s+/g, '-');
        ingredientUrls[nameKey] = url;
      }
    }
  }

  console.log('\n--- UPLOAD COMPLETE ---');
  console.log('Navbar URLs:', JSON.stringify(menuUrls, null, 2));
  console.log('Ingredient URLs:', JSON.stringify(ingredientUrls, null, 2));

  // Write mapping to a file for backup
  fs.writeFileSync('cloudinary_uploaded_assets.json', JSON.stringify({ navbar: menuUrls, ingredients: ingredientUrls }, null, 2));
}

main();
