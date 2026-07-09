import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ContentPasteSearchRoundedIcon from '@mui/icons-material/ContentPasteSearchRounded';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Container, LinearProgress, Stack, Typography } from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import { EditableTableGrid } from '../components/upload/EditableTableGrid';
import { ExtractionToolbar } from '../components/upload/ExtractionToolbar';
import { UploadDropzone } from '../components/upload/UploadDropzone';
import { useUploadExtraction } from '../hooks/useUploadExtraction';
import { exportRowsToCsv, exportRowsToExcel, sanitizeFileBaseName } from '../utils/uploadTableUtils';

const collectRowsFromApi = (gridApi) => {
  const rows = [];
  if (!gridApi) return rows;
  gridApi.forEachNode((node) => {
    if (node?.data) rows.push(node.data);
  });
  return rows;
};

export default function UploadImagePage({ onBackToDashboard }) {
  const {
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
  } = useUploadExtraction();

  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const gridApiRef = useRef(null);

  const hasTableData = headers.length > 0;
  const extractionSummary = useMemo(() => {
    if (!rawPayload) return '';
    const confidence = Number(rawPayload.confidence || 0).toFixed(2);
    return `Rows: ${rowData.length} | Columns: ${headers.length} | Confidence: ${confidence}`;
  }, [rawPayload, rowData.length, headers.length]);

  const updateRowDataFromGrid = () => {
    const rows = collectRowsFromApi(gridApiRef.current);
    setRowData(rows);
  };

  const handleAddRow = () => {
    if (!headers.length) return;
    const newRow = { __id: `${Date.now()}-${Math.random().toString(16).slice(2)}` };
    headers.forEach((header) => {
      newRow[header] = '';
    });
    setRowData((previous) => [...previous, newRow]);
  };

  const handleDeleteSelectedRows = () => {
    if (!selectedRowIds.length) return;
    setRowData((previous) => previous.filter((row) => !selectedRowIds.includes(row.__id)));
    setSelectedRowIds([]);
  };

  const handleExportCsv = () => {
    if (!hasTableData) return;
    exportRowsToCsv({
      headers,
      rowData,
      fileName: `${sanitizeFileBaseName(selectedFile?.name, 'table-data')}-export`,
    });
  };

  const handleExportExcel = async () => {
    if (!hasTableData) return;
    await exportRowsToExcel({
      headers,
      rowData,
      fileName: `${sanitizeFileBaseName(selectedFile?.name, 'table-data')}-export`,
    });
  };

  const handleClearTable = () => {
    clearTable();
    setSelectedRowIds([]);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFFFF', py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={onBackToDashboard}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Back
              </Button>
              <Typography variant="h4" sx={{ color: '#0F172A', fontWeight: 800 }}>
                Smart Document Table Extraction
              </Typography>
            </Stack>
            <Button variant="text" onClick={clearAll} sx={{ textTransform: 'none' }}>
              Reset Page
            </Button>
          </Stack>

          <Card sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}>
            <CardContent>
              <Stack spacing={2.5}>
                <UploadDropzone
                  onFileSelected={setFile}
                  selectedFileName={selectedFile?.name || ''}
                  disabled={isUploading || isProcessing}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    variant="contained"
                    onClick={runUpload}
                    disabled={!selectedFile || isUploading || isProcessing}
                    startIcon={<ContentPasteSearchRoundedIcon />}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Start OCR Extraction
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelRoundedIcon />}
                    onClick={cancelUpload}
                    disabled={!isUploading && !isProcessing}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Cancel Upload
                  </Button>
                </Stack>

                {(isUploading || isProcessing) && (
                  <Card sx={{ borderRadius: 2, bgcolor: '#F8FAFC', boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                    <CardContent>
                      <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" sx={{ color: '#334155' }}>
                          {isUploading ? 'Uploading document...' : 'Processing OCR and table extraction...'}
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={Math.min(uploadProgress || 0, 100)} />
                    </CardContent>
                  </Card>
                )}

                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                {statusMessage && !errorMessage && <Alert severity="info">{statusMessage}</Alert>}

                {previewUrl && (
                  <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Preview
                      </Typography>
                      {isPdfPreview ? (
                        <Box component="iframe" src={previewUrl} title="PDF Preview" sx={{ width: '100%', height: 360, border: 'none' }} />
                      ) : (
                        <Box
                          component="img"
                          src={previewUrl}
                          alt="Uploaded document preview"
                          sx={{ width: '100%', maxHeight: 420, objectFit: 'contain', borderRadius: 1.5, border: '1px solid #E2E8F0' }}
                        />
                      )}
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    Editable Extracted Table
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569' }}>
                    {extractionSummary || 'No table extracted yet.'}
                  </Typography>
                </Stack>

                <ExtractionToolbar
                  disabled={!hasTableData || isUploading || isProcessing}
                  onExportCsv={handleExportCsv}
                  onExportExcel={handleExportExcel}
                  onRefresh={refreshExtraction}
                  onAddRow={handleAddRow}
                  onDeleteRows={handleDeleteSelectedRows}
                  onClearTable={handleClearTable}
                />

                {hasTableData ? (
                  <EditableTableGrid
                    headers={headers}
                    rowData={rowData}
                    onGridReady={(params) => {
                      gridApiRef.current = params.api;
                    }}
                    onSelectionChanged={(params) => {
                      const selected = params.api.getSelectedRows().map((row) => row.__id).filter(Boolean);
                      setSelectedRowIds(selected);
                    }}
                    onRowDataChanged={updateRowDataFromGrid}
                  />
                ) : (
                  <Alert severity="warning">
                    No table extracted. Upload a clear document containing visible table rows and columns.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
