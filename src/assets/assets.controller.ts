import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './assets.service';
import { v4 as uuidv4 } from 'uuid';
import { ImageAssetDto } from './dtos/image.dto';
import { Public } from 'nest-keycloak-connect';

const IMAGE_TEN_MB = 10 * 1024 * 1024;
const IMAGE_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('images')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: IMAGE_TEN_MB },
      fileFilter: (req, file, cb) => {
        if (!IMAGE_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return cb(new BadRequestException('Invalid file type'), false);
        }
        const lowerName = file.originalname.toLowerCase();
        if (
          !(
            lowerName.endsWith('.jpg') ||
            lowerName.endsWith('.jpeg') ||
            lowerName.endsWith('.png') ||
            lowerName.endsWith('.webp')
          )
        ) {
          return cb(new BadRequestException('Invalid file extension'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImageAsset(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImageAssetDto> {
    if (!file) {
      throw new BadRequestException('No file provided for upload');
    }
    const assetId = uuidv4();
    const assetPath = `images/${assetId}`;
    return this.assetsService.uploadAsset(assetPath, file);
  }

  @Public()
  @Get(':type/:id')
  async getAsset(
    @Param('type') type: string,
    @Param('id') id: string,
  ): Promise<StreamableFile> {
    const assetPath = `${type}/${id}`;
    const assetPathDecoded = decodeURIComponent(assetPath);
    const { stream, contentType } =
      await this.assetsService.getFileStream(assetPathDecoded);
    return new StreamableFile(stream, {
      type: contentType,
    });
  }
}
