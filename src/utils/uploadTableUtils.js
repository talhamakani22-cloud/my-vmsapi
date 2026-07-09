const normalizeHeaderValue = (value, index) => {
  const text = String(value || '').trim();
  return text || `Column ${index + 1}`;
};

const deriveHeadersFromRows = (rows) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  const maxColumns = safeRows.reduce((max, row) => {
    if (Array.isArray(row)) return Math.max(max, row.length);
    return max;
  }, 0);
  return Array.from({ length: maxColumns }, (_, index) => `Column ${index + 1}`);
};

const normalizeHeaders = (headers, rows) => {
  const safeHeaders = Array.isArray(headers) ? headers : [];
  if (safeHeaders.length) {
    return safeHeaders.map((header, index) => normalizeHeaderValue(header, index));
  }
  return deriveHeadersFromRows(rows);
};

export const toGridModel = (payload) => {
  const headers = normalizeHeaders(payload?.headers, payload?.rows);
  const sourceRows = Array.isArray(payload?.rows) ? payload.rows : [];

  const rowData = sourceRows.map((row, rowIndex) => {
    const result = { __id: `${Date.now()}-${rowIndex}` };

    if (Array.isArray(row)) {
      headers.forEach((header, colIndex) => {
        result[header] = row[colIndex] ?? '';
      });
      return result;
    }

    if (row && typeof row === 'object') {
      headers.forEach((header) => {
        result[header] = row[header] ?? '';
      });
      return result;
    }

    headers.forEach((header) => {
      result[header] = '';
    });
    return result;
  });

  return {
    headers,
    rowData,
  };
};

export const buildColumnDefs = (headers) =>
  (Array.isArray(headers) ? headers : []).map((header) => ({
    field: header,
    headerName: header,
    editable: true,
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 130,
    flex: 1,
  }));

export const extractRowsFromGridData = (headers, rowData) => {
  const safeHeaders = Array.isArray(headers) ? headers : [];
  const safeRows = Array.isArray(rowData) ? rowData : [];

  return safeRows.map((row) => safeHeaders.map((header) => row?.[header] ?? ''));
};

export const sanitizeFileBaseName = (fileName, fallback = 'extracted-table') => {
  return String(fileName || fallback)
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9_-]/gi, '_');
};

export const exportRowsToCsv = ({ headers, rowData, fileName }) => {
  const safeHeaders = Array.isArray(headers) ? headers : [];
  const rows = extractRowsFromGridData(safeHeaders, rowData);

  const escape = (value) => {
    const text = String(value ?? '');
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const csv = [safeHeaders.map(escape).join(',')]
    .concat(rows.map((row) => row.map(escape).join(',')))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${sanitizeFileBaseName(fileName)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export const exportRowsToExcel = async ({ headers, rowData, fileName }) => {
  const safeHeaders = Array.isArray(headers) ? headers : [];
  const rows = extractRowsFromGridData(safeHeaders, rowData);

  const excelJSImport = await import('exceljs');
  const ExcelJS = excelJSImport.default || excelJSImport;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Extracted Table');

  worksheet.addRow(safeHeaders);
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FF1F2937' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' },
  };

  rows.forEach((row) => worksheet.addRow(row));

  safeHeaders.forEach((_, colIndex) => {
    worksheet.getColumn(colIndex + 1).width = 22;
  });

  for (let row = 1; row <= worksheet.rowCount; row += 1) {
    for (let col = 1; col <= safeHeaders.length; col += 1) {
      const cell = worksheet.getCell(row, col);
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${sanitizeFileBaseName(fileName)}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
