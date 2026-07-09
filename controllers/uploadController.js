const { runOcrExtraction } = require('../services/uploadOcrService');
const { extractTablesFromOcr } = require('../utils/tableExtraction');

const uploadDocument = async (req, res) => {
  try {
    const file = req.file;
    const language = typeof req.body?.language === 'string' && req.body.language.trim()
      ? req.body.language.trim()
      : 'eng';

    const ocrRaw = await runOcrExtraction({
      fileBuffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      language,
    });

    const extracted = extractTablesFromOcr(ocrRaw);

    if (!extracted.tables.length) {
      return res.status(422).json({
        error: 'No table data detected in the uploaded document.',
        headers: [],
        rows: [],
        confidence: 0,
        imageWidth: 0,
        imageHeight: 0,
        tables: [],
      });
    }

    return res.json({
      ...extracted,
      fileName: file.originalname,
      mimeType: file.mimetype,
    });
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 500;

    return res.status(status).json({
      error: error?.message || 'Upload processing failed.',
      details: error?.details || null,
      headers: [],
      rows: [],
      confidence: 0,
      imageWidth: 0,
      imageHeight: 0,
      tables: [],
    });
  }
};

module.exports = {
  uploadDocument,
};
