import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// Storage provider interface
export interface StorageProvider {
  upload(file: Buffer, filename: string, mimeType: string, folder?: string): Promise<string>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
}

// AWS S3 Storage Provider
export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    const region = process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-east-1';
    const accessKeyId = process.env.AWS_API_KEY || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    this.bucket = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || '';

    if (!accessKeyId || !secretAccessKey || !this.bucket) {
      throw new Error('AWS S3 credentials not configured. Set AWS_API_KEY, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME');
    }

    this.client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async upload(file: Buffer, filename: string, mimeType: string, folder: string = 'uploads'): Promise<string> {
    const uniqueFilename = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: uniqueFilename,
      Body: file,
      ContentType: mimeType,
    });

    await this.client.send(command);
    return uniqueFilename; // Return the S3 key
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }
}

// Local/Placeholder Storage Provider (for development/fallback)
export class LocalStorageProvider implements StorageProvider {
  async upload(file: Buffer, filename: string, mimeType: string, folder: string = 'uploads'): Promise<string> {
    // Simulate file upload with a placeholder URL
    const uniqueFilename = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${filename}`;
    return `/storage/${uniqueFilename}`;
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // For local storage, just return the key as-is
    return key;
  }

  async delete(key: string): Promise<void> {
    // In local mode, we don't actually delete anything
    console.log(`[LocalStorage] Delete called for: ${key}`);
  }
}

// Storage Factory - allows switching between providers
export class StorageFactory {
  static getProvider(): StorageProvider {
    const storageType = process.env.STORAGE_PROVIDER || 'local';

    switch (storageType.toLowerCase()) {
      case 's3':
      case 'aws':
        try {
          return new S3StorageProvider();
        } catch (error) {
          console.error('Failed to initialize S3 storage, falling back to local:', error);
          return new LocalStorageProvider();
        }
      case 'local':
      default:
        return new LocalStorageProvider();
    }
  }
}
