'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'm5kmnlps',
  api_key: '213914159766594',
  api_secret: 'BIGtQ9lmkiYf1f-bqVN-X1OJwCQ'
});

export async function uploadImageToCloudinary(base64Data: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // If it's already a URL, just return it
    if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
      return { success: true, url: base64Data };
    }

    if (!base64Data.startsWith('data:image')) {
      return { success: false, error: 'Invalid image format provided.' };
    }

    // Upload to Cloudinary using base64 string
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'kalvix_nexus', // Keep images organized
      resource_type: 'auto'
    });

    return { success: true, url: result.secure_url };
  } catch (err: any) {
    console.error('Cloudinary Upload Error:', err);
    return { success: false, error: err.message || 'Failed to upload image' };
  }
}

export async function deleteImageFromCloudinary(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!url || !url.includes('res.cloudinary.com')) {
      return { success: false, error: 'Invalid Cloudinary URL' };
    }

    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/.../image/upload/v1234567/folder/image_name.jpg
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    const publicId = match ? match[1] : null;

    if (!publicId) {
      return { success: false, error: 'Could not extract public_id from URL' };
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary image deleted: ${publicId}`);

    return { success: true };
  } catch (err: any) {
    console.error('Cloudinary Delete Error:', err);
    return { success: false, error: err.message || 'Failed to delete image' };
  }
}
