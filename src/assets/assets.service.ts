import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class AssetsService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadAsset(assetPath: string, file: Express.Multer.File) {
    const assetKey = `assets/${assetPath}`;
    const contentType = file.mimetype ?? 'application/octet-stream';
    const fileBuffer = file.buffer;

    return await this.s3Service.uploadFile(assetKey, fileBuffer, contentType);
  }

  async getFileStream(assetPath: string) {
    const assetKey = `assets/${assetPath}`;
    return this.s3Service.getFileStream(assetKey);
  }
}
