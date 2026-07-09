const express = require('express');
const router = express.Router();
const multer = require('multer');

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/ocr - Accepts an image and returns extracted text
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.', field: 'file' });
  }

  try {
    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OCR API key is not configured on the server.' });
    }

    const language = (req.body?.language || 'eng').trim();
    const isTable = String(req.body?.isTable || 'false').toLowerCase() === 'true' ? 'true' : 'false';
    const isOverlayRequired = String(req.body?.isOverlayRequired ?? 'true').toLowerCase() === 'true' ? 'true' : 'false';
    // Engine 2 only supports Latin-based languages; Arabic requires Engine 1.
    const ocrEngine = language === 'ara' ? '1' : '2';
    const form = new FormData();
    form.append('apikey', apiKey);
    form.append('language', language);
    form.append('isTable', isTable);
    form.append('isOverlayRequired', isOverlayRequired);
    form.append('OCREngine', ocrEngine);
    form.append(
      'file',
      new Blob([req.file.buffer], { type: req.file.mimetype || 'image/jpeg' }),
      req.file.originalname || 'upload.jpg'
    );

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: form,
    });

    const rawBody = await response.text();
    let data = null;
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = null;
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'OCR provider request failed.',
        status: response.status,
        details: data || rawBody,
      });
    }

    if (data?.IsErroredOnProcessing) {
      return res.status(422).json({
        error: 'OCR provider could not process the image.',
        details: data.ErrorMessage || data.ErrorDetails || data,
      });
    }

    return res.json({
      text: data?.ParsedResults?.[0]?.ParsedText || '',
      raw: data,
    });
  } catch (error) {
    return res.status(500).json({ error: 'OCR processing failed.', details: error.message });
  }
});

module.exports = router;
