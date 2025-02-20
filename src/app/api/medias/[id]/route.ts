import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { MediaManager } from '@/services/media-manager';

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