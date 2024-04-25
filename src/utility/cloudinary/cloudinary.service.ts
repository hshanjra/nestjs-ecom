import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }
  async uploadSingleImage(image: Express.Multer.File) {
    const result = await cloudinary.uploader.upload(image.path);

    const res = {
      url: result.secure_url,
      alt: image.originalname,
      fileType: image.mimetype,
    };

    //  TODO: delete local files
    //delete local file
    // fs.unlinkSync(path.join(__dirname, '././', image.path));

    return res;
  }

  async uploadImagesToCloud(images: Express.Multer.File[]): Promise<any> {
    const uploadedImages = [];

    for (const image of images) {
      const result = await cloudinary.uploader.upload(image.path);
      uploadedImages.push(result.secure_url);
      return uploadedImages;
    }
  }

  async deleteImageFromCloud(imageURL: string): Promise<void> {
    const publicId = this.getPublicId(imageURL);
    await cloudinary.uploader.destroy(publicId);
  }

  private getPublicId(imageURL: string) {
    const startIndex = imageURL.lastIndexOf('/') + 1;
    const endIndex = imageURL.lastIndexOf('.');
    return imageURL.substring(startIndex, endIndex);
  }
}
