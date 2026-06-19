import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { StoredFile, StoragePort } from '../../domain/ports/storage.port';

@Injectable()
export class LocalStorageAdapter implements StoragePort {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'business');

  async saveBusinessLogo(file: StoredFile): Promise<string> {
    await mkdir(this.uploadDir, { recursive: true });
    const extension = extname(file.originalName).toLowerCase();
    const fileName = `${randomUUID()}${extension}`;
    const filePath = join(this.uploadDir, fileName);

    await writeFile(filePath, file.buffer);

    return `/uploads/business/${fileName}`;
  }
}
