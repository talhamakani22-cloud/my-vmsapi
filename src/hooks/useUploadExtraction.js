import { useMemo, useRef, useState } from 'react';
import { uploadDocument, validateUploadFile } from '../services/uploadService';
import { toGridModel } from '../utils/uploadTableUtils';

export function useUploadExtraction() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('Upload a document to start OCR table extraction.');
  const [headers, setHeaders] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [rawPayload, setRawPayload] = useState(null);

  const abortControllerRef = useRef(null);

  const isPdfPreview = useMemo(() => selectedFile?.type === 'application/pdf', [selectedFile]);

  const resetPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const setFile = (file) => {
    const validationMessage = validateUploadFile(file);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
    setStatusMessage('Ready to upload.');

    resetPreview();
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const clearTable = () => {
    setHeaders([]);
    setRowData([]);
    setRawPayload(null);
  };

  const clearAll = () => {
    cancelUpload();
    resetPreview();
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadProgress(0);
    setIsUploading(false);
    setIsProcessing(false);
    setErrorMessage('');
    setStatusMessage('Upload a document to start OCR table extraction.');
    clearTable();
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsUploading(false);
      setIsProcessing(false);
      setStatusMessage('Upload cancelled.');
    }
  };

  const runUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please choose a file first.');
      return;
    }

    const validationMessage = validateUploadFile(selectedFile);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage('');
    setUploadProgress(0);
    setIsUploading(true);
    setIsProcessing(false);
    setStatusMessage('Uploading document...');

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const payload = await uploadDocument({
        file: selectedFile,
        signal: abortController.signal,
        onUploadProgress: (value) => setUploadProgress(value),
      });

      setIsUploading(false);
      setIsProcessing(true);
      setStatusMessage('Processing OCR and extracting table layout...');

      const model = toGridModel(payload);
      setHeaders(model.headers);
      setRowData(model.rowData);
      setRawPayload(payload);
      setStatusMessage(`Extraction completed. ${model.rowData.length} row(s) detected.`);
    } catch (error) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        setStatusMessage('Upload cancelled.');
      } else if (error?.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else if (error?.message?.toLowerCase().includes('network')) {
        setErrorMessage('Network failure. Please check your connection and try again.');
      } else if (error?.message?.toLowerCase().includes('timeout')) {
        setErrorMessage('Upload request timed out. Please retry.');
      } else {
        setErrorMessage('Upload failed. Please try again.');
      }
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const refreshExtraction = async () => {
    await runUpload();
  };

  return {
    selectedFile,
    previewUrl,
    isPdfPreview,
    uploadProgress,
    isUploading,
    isProcessing,
    errorMessage,
    statusMessage,
    headers,
    rowData,
    rawPayload,
    setFile,
    setRowData,
    runUpload,
    cancelUpload,
    refreshExtraction,
    clearTable,
    clearAll,
  };
}
