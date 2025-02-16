import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createThumbnail, createVideoWithThumbnail } from '@/services/media';

interface FileError {
  code: string;
  message: string;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const thumbnail = formData.get('thumbnail') as File | null;
    const threadId = formData.get('threadId') as string | null;
    const isMain = formData.get('isMain') === 'true';
    const alt = formData.get('alt') as string | null;
    const baseUrl = new URL(request.url).origin;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérification du type de fichier
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'audio/mpeg', 'audio/wav'
    ] as const;

    if (!allowedTypes.includes(file.type as typeof allowedTypes[number])) {
      return NextResponse.json(
        { error: `Type de fichier non supporté: ${file.type}` },
        { status: 400 }
      );
    }

    // Vérification de la taille du fichier (100MB max)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Fichier trop volumineux: ${(file.size / (1024 * 1024)).toFixed(2)}MB (max 100MB)` },
        { status: 400 }
      );
    }

    // Si c'est une vidéo, on doit avoir une miniature
    if (file.type.startsWith('video/')) {
      if (!thumbnail) {
        return NextResponse.json(
          { error: 'Une miniature est requise pour les vidéos' },
          { status: 400 }
        );
      }

      // Créer d'abord la miniature
      const thumbnailMedia = await createThumbnail(thumbnail, {
        threadId: threadId ? Number(threadId) : undefined,
        baseUrl,
        alt: alt || undefined
      });

      // Puis créer la vidéo avec la référence à la miniature
      const videoMedia = await createVideoWithThumbnail(file, thumbnailMedia.id, {
        threadId: threadId ? Number(threadId) : undefined,
        baseUrl,
        isMain,
        alt: alt || undefined
      });

      return NextResponse.json({ 
        id: videoMedia.id,
        thumbnailId: thumbnailMedia.id
      });
    }

    // Pour les autres types de médias, utiliser createThumbnail
    const media = await createThumbnail(file, {
      threadId: threadId ? Number(threadId) : undefined,
      baseUrl,
      isMain,
      alt: alt || undefined
    });

    return NextResponse.json({ id: media.id });
  } catch (error) {
    const fileError = error as FileError;
    console.error('Erreur upload:', fileError);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
} 