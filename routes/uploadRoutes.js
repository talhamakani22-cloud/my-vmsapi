const express = require('express');
const { uploadDocument } = require('../controllers/uploadController');
const {
  uploadSingleDocument,
  validateUploadedDocument,
  handleUploadMiddlewareError,
} = require('../middleware/uploadValidation');

const router = express.Router();

router.post(
  '/',
  (req, res, next) => uploadSingleDocument(req, res, (error) => handleUploadMiddlewareError(error, req, res, next)),
  validateUploadedDocument,
  uploadDocument
);

module.exports = router;
