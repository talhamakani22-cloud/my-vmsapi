const multer = require('multer');
const path = require('path');

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
]);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.pdf']);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname || '').toLowerCase();
  const isAllowedMime = ALLOWED_MIME_TYPES.has(file.mimetype);
  const isAllowedExtension = ALLOWED_EXTENSIONS.has(extension);

  if (!isAllowedMime || !isAllowedExtension) {
    cb(new Error('Unsupported file format. Please upload JPG, JPEG, PNG, or PDF.'));
    return;
  }

  cb(null, true);
};

const uploadSingleDocument = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
}).single('file');

const validateUploadedDocument = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded. Please choose a JPG, PNG, JPEG, or PDF file.' });
  }

  if (req.file.size > MAX_FILE_SIZE_BYTES) {
    return res.status(400).json({ error: 'File is too large. Maximum allowed size is 20 MB.' });
  }

  return next();
};

const handleUploadMiddlewareError = (error, req, res, next) => {
  if (!error) {
    return next();
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum allowed size is 20 MB.' });
    }
    return res.status(400).json({ error: `Upload failed: ${error.message}` });
  }

  return res.status(400).json({ error: error.message || 'Invalid upload request.' });
};

module.exports = {
  uploadSingleDocument,
  validateUploadedDocument,
  handleUploadMiddlewareError,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
};
