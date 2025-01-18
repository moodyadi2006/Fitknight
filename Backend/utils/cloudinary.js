import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises'; // Use promises for async file operations

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload an image to Cloudinary and remove it locally
const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    console.error('No file path provided for upload.');
    return null;
  }

  try {
    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto', // Automatically detect the resource type (image, video, etc.)
    });

    console.log('File successfully uploaded to Cloudinary:', response.url);

    // Remove the file from the local server after successful upload
    await fs.unlink(localFilePath);
    console.log('Local file deleted:', localFilePath);

    return response;
  } catch (error) {
    console.error('Error during Cloudinary upload:', error);

    // Ensure the local file is deleted even if upload fails
    try {
      await fs.unlink(localFilePath);
      console.log('Local file deleted after failed upload:', localFilePath);
    } catch (unlinkError) {
      console.error('Error deleting local file:', unlinkError);
    }

    return null;
  }
};

const uploadLocalImageOnCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    console.error('No file path provided for upload.');
    return null;
  }

  try {
    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto', // Automatically detect the resource type (image, video, etc.)
    });

    console.log('File successfully uploaded to Cloudinary:', response.url);
    return response;
  } catch (error) {
    console.error('Error during Cloudinary upload:', error);

    // Ensure the local file is deleted even if upload fails
    try {
      await fs.unlink(localFilePath);
      console.log('Local file deleted after failed upload:', localFilePath);
    } catch (unlinkError) {
      console.error('Error deleting local file:', unlinkError);
    }

    return null;
  }
};

export { uploadOnCloudinary, uploadLocalImageOnCloudinary };
