import prisma from '@/lib/prisma';
import { MediaType, Media } from '@prisma/client';
import { uploadFile, deleteFile } from './minio';

async function generateMediaId(): Promise<string> {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
}

function detectMediaType(mimeType: string): MediaType {
  if (mimeType === 'image/gif') return 'GIF';
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  return 'IMAGE';
}

export interface MediaOptions {
  threadId?: number;
  alt?: string;
}

export async function getMedia(mediaId: string): Promise<Media | null> {
  return await prisma.media.findUnique({
    where: { id: mediaId },
    include: {
      thumbnail: true
    }
  });
}

export async function createThumbnail(file: File, options: MediaOptions): Promise<Media> {
  const { threadId, alt = '' } = options;
  const mediaId = await generateMediaId();
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${mediaId}-${file.name}`;
  const type = detectMediaType(file.type);

  // Upload vers Minio
  await uploadFile(buffer, fileName, file.type);

  // Enregistrement des métadonnées dans la base de données
  return await prisma.media.create({
    data: {
      id: mediaId,
      type,
      alt,
      mimeType: file.type,
      size: buffer.length,
      fileName,
      ...(threadId ? { threadId } : {})
    }
  });
}

export async function createVideoWithThumbnail(file: File, thumbnailId: string, options: MediaOptions): Promise<Media> {
  const { threadId, alt = '' } = options;
  const mediaId = await generateMediaId();
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${mediaId}-${file.name}`;

  const thumbnail = await prisma.media.findUnique({
    where: { id: thumbnailId }
  });

  if (!thumbnail) {
    throw new Error('La miniature spécifiée n\'existe pas');
  }

  // Upload vers Minio
  await uploadFile(buffer, fileName, file.type);

  // Enregistrement des métadonnées dans la base de données
  return await prisma.media.create({
    data: {
      id: mediaId,
      type: 'VIDEO',
      alt,
      mimeType: file.type,
      size: buffer.length,
      fileName,
      thumbnailId,
      ...(threadId ? { threadId } : {})
    }
  });
}

export async function deleteMedia(mediaId: string): Promise<void> {
  const media = await prisma.media.findUnique({
    where: { id: mediaId }
  });

  if (!media || !media.fileName) {
    throw new Error('Média non trouvé');
  }

  // Supprimer le fichier de Minio
  await deleteFile(media.fileName);

  // Supprimer les métadonnées de la base de données
  await prisma.media.delete({
    where: { id: mediaId }
  });
}

export async function getMediaByThread(threadId: number): Promise<Media[]> {
  return prisma.media.findMany({
    where: { threadId },
    orderBy: [
      { createdAt: 'asc' }
    ]
  });
} 