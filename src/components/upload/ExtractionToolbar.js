import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Button, Stack } from '@mui/material';

export function ExtractionToolbar({
  disabled,
  onExportCsv,
  onExportExcel,
  onRefresh,
  onAddRow,
  onDeleteRows,
  onClearTable,
}) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
      <Button disabled={disabled} variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={onExportCsv}>
        Export CSV
      </Button>
      <Button disabled={disabled} variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={onExportExcel}>
        Export Excel
      </Button>
      <Button disabled={disabled} variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={onRefresh}>
        Refresh OCR
      </Button>
      <Button disabled={disabled} variant="outlined" startIcon={<AddRoundedIcon />} onClick={onAddRow}>
        Add Row
      </Button>
      <Button disabled={disabled} variant="outlined" startIcon={<DeleteOutlineRoundedIcon />} onClick={onDeleteRows}>
        Delete Row
      </Button>
      <Button disabled={disabled} variant="outlined" startIcon={<ClearAllRoundedIcon />} onClick={onClearTable}>
        Clear Table
      </Button>
    </Stack>
  );
}
