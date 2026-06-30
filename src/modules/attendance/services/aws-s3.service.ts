import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class AwsS3Service {
  private readonly client = new S3Client({
    region: this.getRequiredEnv('AWS_REGION'),
    credentials: {
      accessKeyId: this.getRequiredEnv('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.getRequiredEnv('AWS_SECRET_ACCESS_KEY'),
    },
  });

  async uploadAttendanceImage(input: {
    companyId: string;
    employeeId: string;
    eventType: 'check-in' | 'check-out';
    contentType: string;
    imageBuffer: Buffer;
  }): Promise<{ key: string; url: string }> {
    const bucket = this.getRequiredEnv('AWS_S3_BUCKET');
    const key = this.buildObjectKey(input);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: input.imageBuffer,
          ContentType: input.contentType,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload attendance image to S3: ${this.getErrorMessage(error)}`,
      );
    }

    return {
      key,
      url: this.buildPublicUrl(bucket, key),
    };
  }

  private buildObjectKey(input: {
    companyId: string;
    employeeId: string;
    eventType: 'check-in' | 'check-out';
    contentType: string;
  }): string {
    const extension = this.getFileExtension(input.contentType);
    const timestamp = Date.now();

    return `attendance/${input.companyId}/${input.employeeId}/${input.eventType}-${timestamp}.${extension}`;
  }

  private buildPublicUrl(bucket: string, key: string): string {
    const publicBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL?.trim();

    if (publicBaseUrl) {
      return `${publicBaseUrl.replace(/\/+$/, '')}/${key}`;
    }

    const region = this.getRequiredEnv('AWS_REGION');
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  private getFileExtension(contentType: string): string {
    if (contentType === 'image/png') {
      return 'png';
    }

    if (contentType === 'image/webp') {
      return 'webp';
    }

    return 'jpg';
  }

  private getRequiredEnv(key: string): string {
    const value = process.env[key]?.trim();

    if (!value) {
      throw new ServiceUnavailableException(`${key} is not configured`);
    }

    return value;
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown AWS error';
  }
}
