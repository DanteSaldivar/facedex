import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import { Multer } from 'multer';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {

     private readonly logger = new Logger(CloudinaryService.name);

    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
        });
    }

    async subirImagen(
        file: Express.Multer.File,
        carpeta: string,
    ): Promise<{ url: string; publicId: string }> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                {
                    folder: carpeta,
                    transformation: [
                        { width: 400, height: 400, crop: 'fill' },
                        { quality: 'auto' },
                    ],
                },
                (error, result?: UploadApiResponse) => {
                    if (error || !result) {
                        this.logger.error('Cloudinary upload failed', error);
                        return reject(new InternalServerErrorException('Error al subir la imagen a la nube'));
                    }

                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                    });
                },
            );

            Readable.from(file.buffer).pipe(upload);
        });
    }

    async eliminarImagen(publicId: string): Promise<void> {
        try {
            const result = await cloudinary.uploader.destroy(publicId);

            // Cloudinary returns { result: 'ok' } on success, or { result: 'not found' }
            if (result.result !== 'ok') {
                this.logger.warn(`No se pudo eliminar o no se encontró la imagen: ${publicId}`);
            }
        } catch (error) {
            this.logger.error(`Error al intentar eliminar la imagen: ${publicId}`, error);
            throw new InternalServerErrorException('Error al eliminar la imagen de la nube');
        }
    }
}
