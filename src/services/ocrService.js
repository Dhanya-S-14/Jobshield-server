import { File } from 'expo-file-system';
import api from './api';

const getMimeType = (uri) => {
  const ext = (uri.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'bmp':
      return 'image/bmp';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
};

export const extractTextFromImage = async (imageUri) => {
  try {
    const file = new File(imageUri);
    if (!file.exists) {
      throw new Error('Image file not found');
    }

    const formData = new FormData();
    const mimeType = getMimeType(imageUri);
    const ext = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
    formData.append('image', {
      uri: imageUri,
      type: mimeType,
      name: `screenshot.${ext}`,
    });

    const response = await api.post('/ocr/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });

    if (response.data && response.data.success === false) {
      throw new Error(response.data.message || 'Failed to extract text from image');
    }

    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Failed to extract text from image');
  }
};
