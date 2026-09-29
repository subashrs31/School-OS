import ExcelJS from 'exceljs';
import { throwError } from '../helpers/throwError';
import { ExcelColumn } from '../types';

export const validateExcel = async (buffer: Uint8Array, columns: ExcelColumn[]): Promise<Record<string, unknown>[]> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
  const sheet = workbook.worksheets[0];

  if (!sheet || sheet.rowCount < 2) throwError('Excel file is empty or has no data rows', 400);

  const headers: string[] = [];
  sheet.getRow(1).eachCell(cell => headers.push(String(cell.value).trim()));
  const headerLower = headers.map(h => h.toLowerCase());

  const missing = columns.map(c => c.name).filter(name => !headerLower.includes(name.toLowerCase()));
  if (missing.length) throwError(`Missing columns: ${missing.join(', ')}`, 400);

  const colIndex: Record<string, number> = {};
  for (const col of columns) {
    const idx = headerLower.indexOf(col.name.toLowerCase());
    if (idx !== -1) colIndex[col.name] = idx + 1;
  }

  const rows: Record<string, unknown>[] = [];
  const errors: Array<{ row: number; errors: string[] }> = [];

  sheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const rowErrors: string[] = [];
    const parsed: Record<string, unknown> = {};

    for (const col of columns) {
      let value: unknown = row.getCell(colIndex[col.name]).value;

      if (col.required && (value === null || value === undefined || value === '')) {
        rowErrors.push(`${col.name} is required`);
        continue;
      }
      if (col.validate && value != null && value !== '') {
        const err = col.validate(value);
        if (err) { rowErrors.push(err); continue; }
      }
      if (col.transform) value = col.transform(value);
      parsed[col.key ?? col.name] = value;
    }

    if (rowErrors.length) errors.push({ row: rowNum, errors: rowErrors });
    else rows.push(parsed);
  });

  if (errors.length) throw Object.assign(new Error('Validation failed'), { statusCode: 422, errors });

  return rows;
};
