import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  CompareFacesCommand,
  Image,
  RekognitionClient,
} from '@aws-sdk/client-rekognition';

@Injectable()
export class AwsFaceVerificationService {
  private readonly client = new RekognitionClient({
    region: this.getRequiredEnv('AWS_REGION'),
    credentials: {
      accessKeyId: this.getRequiredEnv('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.getRequiredEnv('AWS_SECRET_ACCESS_KEY'),
    },
  });

  async verifyAttendanceFace(input: {
    sourceImageBuffer: Buffer;
    referenceImageUrl: string;
    similarityThreshold: number;
  }): Promise<number> {
    const targetImage = await this.resolveTargetImage(input.referenceImageUrl);

    try {
      const result = await this.client.send(
        new CompareFacesCommand({
          SourceImage: {
            Bytes: input.sourceImageBuffer,
          },
          TargetImage: targetImage,
          SimilarityThreshold: input.similarityThreshold,
        }),
      );

      const bestMatch = result.FaceMatches?.sort(
        (left, right) => (right.Similarity ?? 0) - (left.Similarity ?? 0),
      )[0];
      const similarity = bestMatch?.Similarity ?? 0;

      if (!bestMatch || similarity < input.similarityThreshold) {
        throw new ForbiddenException('Face verification failed');
      }

      return similarity;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `AWS Rekognition face verification failed: ${this.getErrorMessage(error)}`,
      );
    }
  }

  private async resolveTargetImage(referenceImageUrl: string): Promise<Image> {
    if (referenceImageUrl.startsWith('s3://')) {
      const withoutProtocol = referenceImageUrl.slice('s3://'.length);
      const firstSlashIndex = withoutProtocol.indexOf('/');

      if (firstSlashIndex === -1) {
        throw new InternalServerErrorException('Invalid S3 reference image url');
      }

      return {
        S3Object: {
          Bucket: withoutProtocol.slice(0, firstSlashIndex),
          Name: withoutProtocol.slice(firstSlashIndex + 1),
        },
      };
    }

    const response = await fetch(referenceImageUrl);

    if (!response.ok) {
      throw new InternalServerErrorException('Failed to download reference face image');
    }

    const arrayBuffer = await response.arrayBuffer();

    return {
      Bytes: Buffer.from(arrayBuffer),
    };
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
