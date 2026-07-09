import axios from 'axios';
import { apiUrl } from '../apiClient';

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
export const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
];

export const validateUploadFile = (file) => {
  if (!file) {
    return 'Please select a file to upload.';
  }

  if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
    return 'Unsupported format. Allowed: JPG, PNG, JPEG, PDF.';
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'File is too large. Maximum allowed size is 20 MB.';
  }

  return '';
};

export const uploadDocument = async ({ file, language = 'eng', signal, onUploadProgress }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  const response = await axios.post(apiUrl('/api/upload'), formData, {
    signal,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      if (!event || !event.total || !onUploadProgress) return;
      const percent = Math.round((event.loaded * 100) / event.total);
      onUploadProgress(percent);
    },
    timeout: 120000,
  });

  return response.data;
};
