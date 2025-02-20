import prisma from '@/lib/prisma';
import { Media, MediaType } from '@prisma/client';
import { uploadFile, deleteFile, generatePresignedUrl } from './minio';

export interface MediaManagerOptions {
  threadId?: number;
  isMain?: boolean;
  alt?: string;
  expiryInSeconds?: number;
}

export class MediaManager {
  /**
   * Génère l'URL publique d'un média
   */
  static getMediaUrl(fileName: string): string {
    const cdnUrl = process.env.MINIO_PUBLIC_URL;
    const bucketName = process.env.MINIO_BUCKET_NAME;
    return `${cdnUrl}/${bucketName}/${fileName}`;
  }

  /**
   * Crée un nouveau média à partir d'un fichier
   */
  static async createMedia(file: File, options: MediaManagerOptions = {}): Promise<Media> {
    const { threadId, isMain = false, alt = '' } = options;
    const mediaId = await this.generateMediaId();
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${mediaId}-${file.name}`;
    const type = this.detectMediaType(file.type);

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
        isMain,
        fileName,
        ...(threadId ? { threadId } : {})
      }
    });
  }

  /**
   * Crée une vidéo avec sa miniature
   */
  static async createVideoWithThumbnail(
    videoFile: File,
    thumbnailFile: File,
    options: MediaManagerOptions = {}
  ): Promise<{ video: Media; thumbnail: Media }> {
    // Créer d'abord la miniature sans threadId
    const thumbnail = await this.createMedia(thumbnailFile, {
      isMain: false,
      alt: options.alt
    });

    // Puis créer la vidéo avec toutes les options
    const video = await this.createMedia(videoFile, options);

    // Mettre à jour la vidéo avec la référence à la miniature
    const updatedVideo = await prisma.media.update({
      where: { id: video.id },
      data: { thumbnailId: thumbnail.id }
    });

    return { video: updatedVideo, thumbnail };
  }

  /**
   * Récupère un média par son ID
   */
  static async getMedia(mediaId: string): Promise<(Media & { 
    url: string;
    thumbnail: (Media & { url: string }) | null;
  }) | null> {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        thumbnail: true,
        thread: true
      }
    });

    if (!media) return null;

    return {
      ...media,
      url: this.getMediaUrl(media.fileName),
      thumbnail: media.thumbnailId && media.thumbnail ? {
        ...media.thumbnail,
        url: this.getMediaUrl(media.thumbnail.fileName)
      } : null
    };
  }

  /**
   * Récupère tous les médias d'un thread
   */
  static async getMediasByThread(threadId: number): Promise<(Media & { url: string })[]> {
    const medias = await prisma.media.findMany({
      where: { 
        threadId,
        // Exclure les médias qui sont des miniatures (ceux qui sont référencés par d'autres médias)
        videos: {
          none: {}
        }
      },
      include: {
        thumbnail: true
      },
      orderBy: [
        { isMain: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    return medias.map(media => ({
      ...media,
      url: this.getMediaUrl(media.fileName),
      thumbnail: media.thumbnail ? {
        ...media.thumbnail,
        url: this.getMediaUrl(media.thumbnail.fileName)
      } : null
    }));
  }

  /**
   * Met à jour les métadonnées d'un média
   */
  static async updateMedia(mediaId: string, data: {
    alt?: string;
    isMain?: boolean;
  }): Promise<Media> {
    return await prisma.media.update({
      where: { id: mediaId },
      data
    });
  }

  /**
   * Supprime un média et son fichier
   */
  static async deleteMedia(mediaId: string): Promise<void> {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        videos: true, // Pour les miniatures, obtenir les vidéos associées
        thumbnail: true // Pour les vidéos, obtenir la miniature associée
      }
    });

    if (!media) {
      throw new Error('Média non trouvé');
    }

    // Si c'est une miniature, mettre à jour les vidéos associées
    if (media.videos.length > 0) {
      await prisma.media.updateMany({
        where: {
          id: {
            in: media.videos.map(v => v.id)
          }
        },
        data: {
          thumbnailId: null
        }
      });
    }

    // Si c'est une vidéo avec une miniature, supprimer la miniature
    if (media.thumbnail) {
      await this.deleteMedia(media.thumbnail.id);
    }

    // Supprimer le fichier de Minio
    if (media.fileName) {
      await deleteFile(media.fileName);
    }

    // Supprimer les métadonnées de la base de données
    await prisma.media.delete({
      where: { id: mediaId }
    });
  }

  /**
   * Génère une URL présignée pour un média
   */
  static async generatePresignedUrl(mediaId: string, expiryInSeconds = 3600): Promise<string> {
    const media = await this.getMedia(mediaId);
    if (!media?.fileName) {
      throw new Error('Média non trouvé');
    }

    return await generatePresignedUrl(media.fileName, expiryInSeconds);
  }

  /**
   * Génère un ID unique pour un média
   */
  private static async generateMediaId(): Promise<string> {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomStr}`;
  }

  /**
   * Détecte le type de média à partir du type MIME
   */
  private static detectMediaType(mimeType: string): MediaType {
    if (mimeType === 'image/gif') return 'GIF';
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    if (mimeType.startsWith('audio/')) return 'AUDIO';
    return 'IMAGE';
  }
} 