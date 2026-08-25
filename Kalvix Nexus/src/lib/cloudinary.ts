export async function uploadToCloudinary(base64Data: string): Promise<string | null> {
  // If it's already a URL, return it
  if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
    return base64Data;
  }
  
  if (!base64Data.startsWith('data:image')) {
    console.error('Invalid image format');
    return null;
  }

  const cloudName = 'm5kmnlps';
  const uploadPreset = 'kalvixnexus';

  const formData = new FormData();
  formData.append('file', base64Data);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'kalvix_nexus');

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary Upload Error:', errorData);
      return null;
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
}
