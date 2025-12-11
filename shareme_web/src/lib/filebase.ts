import { logger } from './logger.js';
import type { FilebaseSettings } from './settings.js';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

function createFilebaseClient(credentials: FilebaseSettings): S3Client {
    logger.debug('Creating Filebase client...');

    const client = new S3Client({
        endpoint: 'https://s3.filebase.com',
        region: 'us-east-1',
        credentials: {
            accessKeyId: credentials.filebase_access_key,
            secretAccessKey: credentials.filebase_secret_access_key
        },
        forcePathStyle: true
    });

    logger.info('Filebase client created successfully.');

    return client;
}

export class FilebaseStorage {
    private credentials: FilebaseSettings;
    private client: S3Client;

    constructor(settings: FilebaseSettings) {
        logger.debug('Initializing FilebaseStorage class...');
        this.credentials = settings;
        this.client = createFilebaseClient(this.credentials);
    }

    private buildKey(objectName: string, folderPath?: string): string {
        if (!folderPath) return objectName;
        folderPath = folderPath.replace(/^\/+|\/+$/g, '');
        return folderPath ? `${folderPath}/${objectName}` : objectName;
    }

    async uploadToBucket(
        fileData: string | Buffer | Readable,
        objectName: string,
        folderPath: string
    ): Promise<[string | null, Error | null]> {
        const bucket = this.credentials.filebase_bucket_name;
        const key = this.buildKey(objectName, folderPath);

        logger.info(`Uploading to Filebase bucket: ${bucket}/${key}`);

        let body: Buffer | Readable;
        try {
            if (typeof fileData === 'string') {
                body = createReadStream(fileData);
            } else if (Buffer.isBuffer(fileData) || fileData instanceof Readable) {
                body = fileData;
            } else {
                return [null, Error('Invalid file data type.')];
            }

            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: body
            });

            await this.client.send(command);
            logger.info(`Upload successful: ${key}`);
            return [key, null];
        } catch (error: any) {
            logger.error(`Upload failed: ${error.message}`);
            return [null, new Error(`Error uploading file to Filebase: ${error.message}`)];
        }
    }

    async uploadBytes(
        data: Buffer,
        objectName: string,
        folderPath: string
    ): Promise<[string | null, Error | null]> {
        return this.uploadToBucket(data, objectName, folderPath);
    }

    async downloadFromBucket(
        objectName: string,
        folderPath: string
    ): Promise<[Buffer | null, Error | null]> {
        const bucket = this.credentials.filebase_bucket_name;
        const key = this.buildKey(objectName, folderPath);

        logger.info(`Downloading from Filebase bucket: ${bucket}/${key}`);

        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key
            });

            const response = await this.client.send(command);

            if (response.Body) {
                const chunks: Buffer[] = [];
                for await (const chunk of response.Body as AsyncIterable<Buffer>) {
                    chunks.push(chunk);
                }
                const data = Buffer.concat(chunks);
                logger.info(`Download successful: ${key}`);
                return [data, null];
            } else {
                return [null, new Error('File not found or empty.')];
            }
        } catch (error: any) {
            logger.error(`Download failed: ${error.message}`);
            return [null, new Error(`Error downloading file from Filebase: ${error.message}`)];
        }
    }
}
