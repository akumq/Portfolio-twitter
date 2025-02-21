import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { MediaManager } from '@/services/media-manager';

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
    const threadId = formData.get('threadId') as string | null;
    const alt = formData.get('alt') as string | null;
    const isThumbnail = formData.get('isThumbnail') === 'true';
    const thumbnailId = formData.get('thumbnailId') as string | null;

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

    // Créer le média avec les options appropriées
    const media = await MediaManager.createMedia(file, {
      threadId: threadId ? Number(threadId) : undefined,
      alt: alt || undefined,
      isThumbnail,
      ...(thumbnailId ? { thumbnailId } : {})
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