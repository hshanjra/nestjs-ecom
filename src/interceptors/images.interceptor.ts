import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ImagesInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    // const images = request.files['images'];
    const images = request.files;

    this.validateImages(images);

    return next.handle().pipe(
      catchError((error) => {
        // Handle any errors that occur during image validation
        if (error instanceof BadRequestException) {
          throw new BadRequestException(error.message);
        }
        throw error;
      }),
    );
  }

  private validateImages(images: Express.Multer.File[]) {
    if (!images || images.length === 0) {
      throw new BadRequestException('Please upload at least one image.');
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/jpg',
      'image/webp',
    ];
    for (const file of images) {
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Product images must be of type JPEG, PNG, GIF, WebP.',
        );
      }
    }
  }
}
