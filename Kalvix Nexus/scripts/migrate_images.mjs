// Firebase Database URL
const DB_URL = 'https://kalvix-nexus-default-rtdb.firebaseio.com';
const CLOUD_NAME = 'm5kmnlps';
const UPLOAD_PRESET = 'kalvixnexus';

async function uploadToCloudinary(base64Data, path) {
  try {
    const formData = new FormData();
    formData.append('file', base64Data);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'kalvix_nexus_migrated');

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error(`Cloudinary Error for path ${path}`);
      return null;
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error(`Error uploading image for path ${path}:`, error);
    return null;
  }
}

async function migrateData() {
  console.log("Fetching full database...");
  const res = await fetch(`${DB_URL}/.json`);
  if (!res.ok) {
    console.error("Failed to fetch database");
    return;
  }
  
  const data = await res.json();
  if (!data) return;

  const updates = {};
  let imageCount = 0;

  // Helper to recursively find base64 strings
  function searchForImages(obj, currentPath) {
    if (!obj) return;
    
    if (typeof obj === 'string' && obj.startsWith('data:image')) {
      updates[currentPath] = obj;
      imageCount++;
      return;
    }

    if (typeof obj === 'object') {
      for (const key in obj) {
        searchForImages(obj[key], `${currentPath}/${key}`);
      }
    }
  }

  console.log("Scanning for Base64 images...");
  searchForImages(data, '');

  console.log(`Found ${imageCount} images to migrate.`);
  
  let i = 1;
  for (const [path, base64Data] of Object.entries(updates)) {
    console.log(`Migrating image ${i}/${imageCount}...`);
    const newUrl = await uploadToCloudinary(base64Data, path);
    if (newUrl) {
      // Update Firebase directly
      const patchRes = await fetch(`${DB_URL}${path}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUrl)
      });
      if (patchRes.ok) {
        console.log(`Successfully migrated and updated: ${path}`);
      } else {
        console.error(`Failed to update Firebase for path: ${path}`);
      }
    }
    i++;
  }

  console.log("Migration complete!");
}

migrateData();
