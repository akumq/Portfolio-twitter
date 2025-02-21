import { NextRequest, NextResponse } from 'next/server';
import { MediaManager } from '@/services/media-manager';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get('fileName');

  if (!fileName) {
    return NextResponse.json(
      { error: 'fileName est requis' },
      { status: 400 }
    );
  }

  try {
    const url = MediaManager.getMediaUrl(fileName);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 