import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createThumbnail, createVideoWithThumbnail } from '@/services/media';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    
    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId manquant' },
        { status: 400 }
      );
    }

    const medias = await prisma.media.findMany({
      where: { threadId: Number(threadId) },
      select: {
        id: true,
        url: true,
        type: true,
        alt: true,
        isMain: true,
        mimeType: true
      },
      orderBy: [
        { isMain: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    return NextResponse.json({ medias });
  } catch (error) {
    console.error('Erreur récupération médias:', error);
    return NextResponse.json(
      { error: 'Échec de la récupération' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const thumbnail = formData.get('thumbnail') as File;
    const threadId = formData.get('threadId');
    const isMain = formData.get('isMain') === 'true';
    const alt = formData.get('alt') as string;
    const baseUrl = new URL(request.url).origin;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérification du type de fichier
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'audio/mpeg', 'audio/wav'
    ];

    if (!allowedTypes.includes(file.type)) {
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
        alt
      });

      // Puis créer la vidéo avec la référence à la miniature
      const videoMedia = await createVideoWithThumbnail(file, thumbnailMedia.id, {
        threadId: threadId ? Number(threadId) : undefined,
        baseUrl,
        isMain,
        alt
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
      alt
    });

    return NextResponse.json({ id: media.id });
  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
} 