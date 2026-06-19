export const STORAGE_PORT = Symbol('STORAGE_PORT');

export interface StoredFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export interface StoragePort {
  saveBusinessLogo(file: StoredFile): Promise<string>;
}
