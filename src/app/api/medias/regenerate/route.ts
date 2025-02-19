import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RegenerateMediaRequest {
  mediaId: string;
}

// Fonction utilitaire pour générer l'URL du média
function generateMediaUrl(mediaId: string, baseUrl: string) {
  return `${baseUrl}/api/medias/${mediaId}`;
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
    const baseUrl = "https://sowamadou.com";

    if (!mediaId) {
      return NextResponse.json(
        { error: 'ID du média requis' },
        { status: 400 }
      );
    }

    // Générer une nouvelle URL
    const newUrl = generateMediaUrl(mediaId, baseUrl);

    // Mettre à jour l'URL dans la base de données
    const media = await prisma.media.update({
      where: { id: mediaId },
      data: { url: newUrl },
    });

    // Si c'est l'image principale d'un thread, mettre à jour l'URL du thread aussi
    if (media.threadId && media.isMain) {
      await prisma.thread.update({
        where: { id: media.threadId },
        data: { imageUrl: newUrl }
      });
    }

    return NextResponse.json({ url: newUrl });
  } catch (error) {
    console.error('Erreur lors de la régénération de l\'URL:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 