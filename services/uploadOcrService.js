const runOcrExtraction = async ({ fileBuffer, fileName, mimeType, language = 'eng' }) => {
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) {
    const error = new Error('OCR API key is not configured on the server.');
    error.status = 500;
    throw error;
  }

  const form = new FormData();
  form.append('apikey', apiKey);
  form.append('language', language);
  form.append('isTable', 'true');
  form.append('isOverlayRequired', 'true');
  form.append('OCREngine', language === 'ara' ? '1' : '2');
  form.append(
    'file',
    new Blob([fileBuffer], { type: mimeType || 'application/octet-stream' }),
    fileName || 'document'
  );

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: form,
  });

  const rawText = await response.text();
  let payload = null;
  try {
    payload = JSON.parse(rawText);
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error('OCR provider request failed.');
    error.status = response.status;
    error.details = payload || rawText;
    throw error;
  }

  if (payload?.IsErroredOnProcessing) {
    const error = new Error('OCR provider could not process the document.');
    error.status = 422;
    error.details = payload?.ErrorMessage || payload?.ErrorDetails || payload;
    throw error;
  }

  return payload;
};

module.exports = {
  runOcrExtraction,
};
