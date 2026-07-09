const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const median = (values) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
};

const mergeBoundingBoxes = (boxes) => {
  const valid = boxes.filter(Boolean);
  if (!valid.length) return null;

  const left = Math.min(...valid.map((box) => box.left));
  const top = Math.min(...valid.map((box) => box.top));
  const right = Math.max(...valid.map((box) => box.left + box.width));
  const bottom = Math.max(...valid.map((box) => box.top + box.height));

  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
};

const normalizeWords = (parsedResult, pageIndex) => {
  const overlayLines = Array.isArray(parsedResult?.TextOverlay?.Lines) ? parsedResult.TextOverlay.Lines : [];
  const pageTopOffset = pageIndex * 100000;

  return overlayLines.flatMap((line) => {
    const lineTop = toNumber(line?.MinTop, 0);
    const words = Array.isArray(line?.Words) ? line.Words : [];

    return words
      .map((word) => {
        const text = String(word?.WordText || '').trim();
        if (!text) return null;

        const left = toNumber(word?.Left, 0);
        const top = toNumber(word?.Top, lineTop);
        const width = Math.max(0, toNumber(word?.Width, 0));
        const height = Math.max(0, toNumber(word?.Height, toNumber(line?.MaxHeight, 0)));
        const confidence = toNumber(word?.Confidence, toNumber(line?.Words?.[0]?.Confidence, 0));

        return {
          text,
          left,
          top: top + pageTopOffset,
          width,
          height,
          right: left + width,
          bottom: top + pageTopOffset + height,
          confidence,
          pageIndex,
          boundingBox: {
            left,
            top,
            width,
            height,
          },
        };
      })
      .filter(Boolean);
  });
};

const clusterRows = (words) => {
  if (!words.length) return [];

  const sorted = [...words].sort((a, b) => {
    if (a.top !== b.top) return a.top - b.top;
    return a.left - b.left;
  });

  const heights = sorted.map((word) => word.height).filter((h) => h > 0);
  const rowThreshold = Math.max(8, median(heights) * 0.7 || 12);
  const rows = [];

  sorted.forEach((word) => {
    let target = null;
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      const candidate = rows[i];
      if (Math.abs(word.top - candidate.centerTop) <= rowThreshold) {
        target = candidate;
        break;
      }
    }

    if (!target) {
      rows.push({
        words: [word],
        centerTop: word.top,
      });
      return;
    }

    target.words.push(word);
    const total = target.words.reduce((sum, item) => sum + item.top, 0);
    target.centerTop = total / target.words.length;
  });

  return rows
    .map((row) => ({
      ...row,
      words: row.words.sort((a, b) => a.left - b.left),
    }))
    .sort((a, b) => a.centerTop - b.centerTop);
};

const clusterColumns = (rows) => {
  const allWords = rows.flatMap((row) => row.words);
  if (!allWords.length) return [];

  const widths = allWords.map((word) => word.width).filter((w) => w > 0);
  const snapDistance = Math.max(12, Math.min(42, median(widths) * 0.8 || 24));
  const anchors = [];

  allWords
    .map((word) => word.left)
    .sort((a, b) => a - b)
    .forEach((left) => {
      const existingIndex = anchors.findIndex((anchor) => Math.abs(anchor - left) <= snapDistance);
      if (existingIndex === -1) {
        anchors.push(left);
        return;
      }
      anchors[existingIndex] = Math.round((anchors[existingIndex] + left) / 2);
    });

  return anchors.sort((a, b) => a - b);
};

const assignWordsToCells = (rowWords, columnAnchors) => {
  const buckets = Array.from({ length: columnAnchors.length }, () => []);

  rowWords.forEach((word) => {
    if (!columnAnchors.length) return;

    let bestIndex = 0;
    let minDistance = Math.abs(word.left - columnAnchors[0]);

    for (let index = 1; index < columnAnchors.length; index += 1) {
      const distance = Math.abs(word.left - columnAnchors[index]);
      if (distance < minDistance) {
        minDistance = distance;
        bestIndex = index;
      }
    }

    buckets[bestIndex].push(word);
  });

  return buckets.map((bucket, colIndex) => {
    const text = bucket
      .sort((a, b) => a.left - b.left)
      .map((word) => word.text)
      .join(' ')
      .trim();

    const confidence = bucket.length
      ? bucket.reduce((sum, word) => sum + toNumber(word.confidence, 0), 0) / bucket.length
      : 0;

    const mergedBoundingBox = mergeBoundingBoxes(bucket.map((word) => word.boundingBox));

    return {
      col_index: colIndex,
      text,
      rowspan: 1,
      colspan: 1,
      is_header: false,
      confidence,
      boundingBox: mergedBoundingBox,
      coordinates: mergedBoundingBox
        ? {
          x: mergedBoundingBox.left,
          y: mergedBoundingBox.top,
          width: mergedBoundingBox.width,
          height: mergedBoundingBox.height,
        }
        : null,
    };
  });
};

const buildTableFromWords = (words, tableIndex, title) => {
  const rows = clusterRows(words);
  const columns = clusterColumns(rows);

  const normalizedRows = rows.map((row, rowIndex) => ({
    row_index: rowIndex,
    cells: assignWordsToCells(row.words, columns),
  }));

  if (normalizedRows.length > 0 && normalizedRows[0].cells.length > 0) {
    normalizedRows[0].cells = normalizedRows[0].cells.map((cell) => ({
      ...cell,
      is_header: true,
    }));
  }

  const headers = normalizedRows[0]?.cells?.map((cell, index) => {
    const value = String(cell.text || '').trim();
    return value || `Column ${index + 1}`;
  }) || [];

  const bodyRows = normalizedRows.slice(1).map((row) => row.cells.map((cell) => cell.text || ''));

  const allCellConfidences = normalizedRows
    .flatMap((row) => row.cells.map((cell) => toNumber(cell.confidence, 0)))
    .filter((value) => Number.isFinite(value));

  const confidence = allCellConfidences.length
    ? allCellConfidences.reduce((sum, value) => sum + value, 0) / allCellConfidences.length
    : 0;

  const tableBoundingBox = mergeBoundingBoxes(
    normalizedRows
      .flatMap((row) => row.cells)
      .map((cell) => cell.boundingBox)
      .filter(Boolean)
  );

  return {
    table_index: tableIndex,
    title,
    headers,
    rows: bodyRows,
    rowObjects: normalizedRows,
    confidence,
    boundingBox: tableBoundingBox,
  };
};

const extractTablesFromOcr = (ocrRaw) => {
  const parsedResults = Array.isArray(ocrRaw?.ParsedResults) ? ocrRaw.ParsedResults : [];

  const tables = parsedResults
    .map((parsedResult, index) => {
      const words = normalizeWords(parsedResult, index);
      if (!words.length) return null;
      return buildTableFromWords(words, index, `Table ${index + 1}`);
    })
    .filter(Boolean)
    .map((table) => ({
      table_index: table.table_index,
      title: table.title,
      headers: table.headers,
      rows: table.rows,
      confidence: Number(table.confidence.toFixed(2)),
      boundingBox: table.boundingBox,
      cells: table.rowObjects,
    }));

  const primaryTable = [...tables].sort((a, b) => (b.rows.length + 1) - (a.rows.length + 1))[0] || null;

  const allCells = tables.flatMap((table) => table.cells.flatMap((row) => row.cells));
  const confidenceValues = allCells.map((cell) => toNumber(cell.confidence, 0)).filter((value) => Number.isFinite(value));
  const confidence = confidenceValues.length
    ? confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length
    : 0;

  const allBoxes = allCells.map((cell) => cell.boundingBox).filter(Boolean);
  const mergedBox = mergeBoundingBoxes(allBoxes);

  return {
    headers: primaryTable?.headers || [],
    rows: primaryTable?.rows || [],
    confidence: Number(confidence.toFixed(2)),
    imageWidth: mergedBox ? mergedBox.width + mergedBox.left : 0,
    imageHeight: mergedBox ? mergedBox.height + mergedBox.top : 0,
    tables,
  };
};

module.exports = {
  extractTablesFromOcr,
};
