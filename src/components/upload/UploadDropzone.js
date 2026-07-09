import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

export function UploadDropzone({ onFileSelected, selectedFileName, disabled }) {
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <Paper
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '2px dashed #CBD5E1',
        backgroundColor: '#F8FAFC',
        p: 3,
      }}
    >
      <Stack spacing={2} alignItems="center" textAlign="center">
        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            backgroundColor: '#E2E8F0',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <CloudUploadRoundedIcon sx={{ color: '#334155' }} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
          Drag and drop invoice, bill, report, or receipt
        </Typography>

        <Typography variant="body2" sx={{ color: '#475569' }}>
          Supported: JPG, PNG, JPEG, PDF | Max: 20 MB
        </Typography>

        <Button
          variant="contained"
          component="label"
          disabled={disabled}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            backgroundColor: '#0F172A',
            '&:hover': { backgroundColor: '#111827' },
          }}
        >
          Browse File
          <input
            hidden
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFileSelected(file);
              event.target.value = '';
            }}
          />
        </Button>

        <Stack direction="row" spacing={1} alignItems="center">
          <InsertDriveFileRoundedIcon fontSize="small" sx={{ color: '#475569' }} />
          <Typography variant="body2" sx={{ color: '#334155' }}>
            {selectedFileName || 'No file selected'}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
