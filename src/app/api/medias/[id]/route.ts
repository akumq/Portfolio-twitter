import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getMedia } from '@/services/media';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const media = await getMedia(params.id);

    if (!media || !media.data) {
      return NextResponse.json(
        { error: 'Média non trouvé' },
        { status: 404 }
      );
    }

    // Convertir le Buffer en Uint8Array pour le streaming
    const buffer = media.data as unknown as Buffer;
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(buffer);
        controller.close();
      },
    });

    // Retourner la réponse avec le bon type MIME
    return new NextResponse(stream, {
      headers: {
        'Content-Type': media.mimeType,
        'Content-Length': media.size.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache pour 1 an
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du média:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 