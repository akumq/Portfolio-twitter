import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { MediaManager } from '@/services/media-manager';

interface RegenerateMediaRequest {
  mediaId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification et des droits admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { mediaId } = await request.json() as RegenerateMediaRequest;

    if (!mediaId) {
      return NextResponse.json(
        { error: 'ID du média requis' },
        { status: 400 }
      );
    }

    // Récupérer le média
    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Média non trouvé' },
        { status: 404 }
      );
    }

    // Générer l'URL avec MediaManager
    const url = MediaManager.getMediaUrl(media.fileName);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Erreur lors de la régénération de l\'URL:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 