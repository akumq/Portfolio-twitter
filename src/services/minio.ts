import { Client } from 'minio';

// Configuration du client Minio
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'portfolio-media';

// Assurer que le bucket existe
export async function ensureBucket() {
  const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
  if (!bucketExists) {
    await minioClient.makeBucket(BUCKET_NAME);
    // Configuration de la politique de bucket pour l'accès public
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
  }
}

// Upload un fichier vers Minio
export async function uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<void> {
  await ensureBucket();
  await minioClient.putObject(BUCKET_NAME, fileName, buffer, buffer.length, {
    'Content-Type': mimeType,
  });
}

// Supprimer un fichier de Minio
export async function deleteFile(fileName: string): Promise<void> {
  await minioClient.removeObject(BUCKET_NAME, fileName);
}

// Générer une URL présignée pour un fichier
export async function generatePresignedUrl(fileName: string, expiryInSeconds = 3600): Promise<string> {
  return await minioClient.presignedGetObject(BUCKET_NAME, fileName, expiryInSeconds);
} 