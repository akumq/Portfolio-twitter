import prisma from '@/lib/prisma';
import { MediaType, Media } from '@prisma/client';

function generateMediaUrl(mediaId: string, baseUrl: string) {
  return `${baseUrl}/api/medias/${mediaId}`;
}

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

interface MediaOptions {
  threadId?: number;
  baseUrl: string;
  isMain?: boolean;
  alt?: string;
}

export async function createThumbnail(file: File, options: MediaOptions): Promise<Media> {
  try {
    const { baseUrl, alt = '', isMain = false, threadId } = options;
    const mediaId = await generateMediaId();
    const buffer = Buffer.from(await file.arrayBuffer());

    const mediaType = detectMediaType(file.type);

    const media = await prisma.media.create({
      data: {
        id: mediaId,
        type: mediaType,
        url: generateMediaUrl(mediaId, baseUrl),
        alt,
        data: buffer,
        mimeType: file.type,
        size: buffer.length,
        isMain,
        ...(threadId ? { threadId } : {})
      }
    });

    return media;
  } catch (error) {
    console.error('Erreur lors de la création du média:', error);
    throw new Error('Erreur lors de la création du média');
  }
}

export async function createVideoWithThumbnail(file: File, thumbnailId: string, options: MediaOptions): Promise<Media> {
  try {
    const { threadId, baseUrl, isMain = false, alt = '' } = options;
    const mediaId = await generateMediaId();
    const buffer = Buffer.from(await file.arrayBuffer());

    const thumbnail = await prisma.media.findUnique({
      where: { id: thumbnailId }
    });

    if (!thumbnail) {
      throw new Error('La miniature spécifiée n\'existe pas');
    }

    const media = await prisma.media.create({
      data: {
        id: mediaId,
        type: 'VIDEO',
        url: generateMediaUrl(mediaId, baseUrl),
        alt,
        data: buffer,
        mimeType: file.type,
        size: buffer.length,
        isMain,
        ...(threadId ? { threadId } : {}),
        thumbnailId
      },
      include: {
        thumbnail: true
      }
    });

    return media;
  } catch (error) {
    console.error('Erreur lors de la création de la vidéo:', error);
    throw new Error('Erreur lors de la création de la vidéo');
  }
}

export async function getMedia(id: string): Promise<Media | null> {
  return prisma.media.findUnique({
    where: { id }
  });
}

export async function getMediaByThread(threadId: number): Promise<Media[]> {
  return prisma.media.findMany({
    where: { threadId },
    orderBy: [
      { isMain: 'desc' },
      { createdAt: 'asc' }
    ]
  });
} 