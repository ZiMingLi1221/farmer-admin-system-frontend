/** MIME type → display label / CSS class mapping for document file icons. */
export interface FileTypeEntry {
  label: string;
  cls: string;
}

export const MIME_FILE_TYPE: Record<string, FileTypeEntry> = {
  'application/pdf': { label: 'PDF', cls: 'icon-pdf' },
  'application/msword': { label: 'DOC', cls: 'icon-word' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    label: 'DOC',
    cls: 'icon-word',
  },
  'text/plain': { label: 'TXT', cls: 'icon-txt' },
};

/** Returns the FileTypeEntry for a MIME type, or a default for unknown types. */
export function fileTypeOf(mime: string): FileTypeEntry {
  return MIME_FILE_TYPE[mime] ?? { label: 'FILE', cls: 'icon-default' };
}
