import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { fromEnv } from '@aws-sdk/credential-providers';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName = process.env.S3_BUCKET_NAME;

  constructor() {
    this.s3Client = new S3Client({
      forcePathStyle: true,
      region: process.env.AWS_REGION,
      credentials: fromEnv(),
      endpoint: process.env.S3_ENDPOINT,
    });
  }

  async uploadFile(key: string, file: Buffer, contentType: string) {
    if (!this.bucketName) {
      throw new HttpException('Storage is not configured', 500);
    }
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    try {
      await this.s3Client.send(command);
      const fileStreamUrl = `${process.env.ORIGIN}/api/${key}`;
      return { url: fileStreamUrl, contentType };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new HttpException('Failed to upload file', 500);
    }
  }

  async getFileStream(key: string): Promise<{
    stream: Readable;
    contentType?: string;
    contentLength?: number;
  }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const data = await this.s3Client.send(command);
      if (!data.Body) {
        throw new NotFoundException('Resource not found');
      }

      const stream = data.Body as Readable;

      return {
        stream,
        contentType: data.ContentType,
        contentLength: data.ContentLength,
      };
    } catch (err) {
      console.error('Error getting file from S3:', err);
      throw new NotFoundException(
        'Không tìm thấy file hoặc không đọc được từ S3',
      );
    }
  }
}
