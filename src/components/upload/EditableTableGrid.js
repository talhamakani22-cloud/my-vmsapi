import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Box } from '@mui/material';
import { buildColumnDefs } from '../../utils/uploadTableUtils';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

export function EditableTableGrid({ headers, rowData, onGridReady, onSelectionChanged, onRowDataChanged }) {
  const columnDefs = useMemo(() => buildColumnDefs(headers), [headers]);

  return (
    <Box sx={{ width: '100%', minHeight: 360 }}>
      <div className="ag-theme-quartz" style={{ width: '100%', minHeight: 360 }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          domLayout="autoHeight"
          rowSelection={{ mode: 'multiRow' }}
          suppressRowClickSelection={false}
          animateRows
          defaultColDef={{
            editable: true,
            sortable: true,
            filter: true,
            resizable: true,
            floatingFilter: true,
          }}
          onGridReady={onGridReady}
          onSelectionChanged={onSelectionChanged}
          onCellValueChanged={onRowDataChanged}
          onCellPasteEnd={onRowDataChanged}
          suppressClipboardPaste={false}
        />
      </div>
    </Box>
  );
}
