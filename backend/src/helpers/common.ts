const ALLOWED_FILE_EXTENSIONS = ['.xlsx', '.xls', '.csv'] as const;

export const generateSlug = (name: string): string =>
  name.toLowerCase().replace(/\s+/g, '').trim();

export const validateFileExtension = (fileName: string): string | null => {
  if (!fileName) return 'File name is required';
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  if (!(ALLOWED_FILE_EXTENSIONS as readonly string[]).includes(ext))
    return `Invalid file type. Allowed: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`;
  return null;
};

export interface SchemaField {
  required?: boolean;
  aliases?: string[];
  default?: string;
  validate?: (v: string) => true | string;
}

export interface ValidationResult {
  valid: Record<string, string>[];
  errors: Array<{ row: number; field: string; value: string; message: string }>;
}

export const validateExcelData = (
  rows: Record<string, unknown>[],
  schema: Record<string, SchemaField>
): ValidationResult => {
  if (!rows?.length) return { valid: [], errors: [{ row: 0, field: '-', value: '-', message: 'No data rows found' }] };

  const fileHeaders = Object.keys(rows[0]);
  const fieldMap: Record<string, string> = {};
  const headerErrors: ValidationResult['errors'] = [];

  for (const [field, config] of Object.entries(schema)) {
    const allNames = [field, ...(config.aliases ?? [])].map(n => n.toLowerCase());
    const match = fileHeaders.find(h => allNames.includes(h.toLowerCase().trim()));
    if (match) {
      fieldMap[field] = match;
    } else if (config.required) {
      headerErrors.push({ row: 0, field, value: '-', message: `Missing required column: "${field}"` });
    }
  }

  if (headerErrors.length) return { valid: [], errors: headerErrors };

  const valid: Record<string, string>[] = [];
  const errors: ValidationResult['errors'] = [];

  rows.forEach((row, i) => {
    const parsed: Record<string, string> = {};
    const rowNum = i + 2;
    let hasError = false;

    for (const [field, config] of Object.entries(schema)) {
      const header = fieldMap[field];
      let val = header ? String(row[header] ?? '').trim() : '';
      if (!val && config.default !== undefined) val = String(config.default);

      if (!val && config.required) {
        errors.push({ row: rowNum, field, value: '', message: `"${field}" is required` });
        hasError = true;
      } else if (val && config.validate) {
        const result = config.validate(val);
        if (result !== true) {
          errors.push({ row: rowNum, field, value: val, message: String(result) });
          hasError = true;
        }
      }
      parsed[field] = val;
    }

    if (!hasError) valid.push(parsed);
  });

  return { valid, errors };
};
