import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { MediaManager } from '@/services/media-manager';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const media = await MediaManager.getMedia(params.id);

    if (!media) {
      return NextResponse.json(
        { error: 'Média non trouvé' },
        { status: 404 }
      );
    }

    // Pour les vidéos, générer une URL présignée
    if (media.type === 'VIDEO') {
      const presignedUrl = await MediaManager.generatePresignedUrl(media.id);
      return NextResponse.redirect(presignedUrl);
    }

    // Pour les autres types, rediriger vers l'URL directe
    return NextResponse.redirect(media.url);
  } catch (error) {
    console.error('Erreur lors de la récupération du média:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return new NextResponse(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401,
    });
  }

  try {
    const { alt } = await request.json();
    const updatedMedia = await MediaManager.updateMedia(params.id, { alt });
    return NextResponse.json(updatedMedia);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du média:', error);
    return new NextResponse(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return new NextResponse(JSON.stringify({ error: 'Non autorisé' }), {
      status: 401,
    });
  }

  try {
    const media = await prisma.media.findUnique({
      where: { id: params.id }
    });

    if (!media) {
      return new NextResponse(JSON.stringify({ error: 'Média non trouvé' }), {
        status: 404,
      });
    }

    // Supprimer le fichier de Minio
    await MediaManager.deleteMedia(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du média:', error);
    return new NextResponse(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
    });
  }
} 