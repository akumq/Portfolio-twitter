import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getImage } from '@/services/image';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse('ID manquant', { status: 400 });
    }

    const image = await getImage(id);
    if (!image) return new NextResponse('Not found', { status: 404 });

    return new NextResponse(image.data, {
      headers: {
        'Content-Type': image.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Erreur récupération image:', error);
    return new NextResponse('Erreur interne', { status: 500 });
  }
} 