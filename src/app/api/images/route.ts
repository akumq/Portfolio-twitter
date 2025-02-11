import { NextRequest, NextResponse } from 'next/server';
import { getImagesByThread } from '@/services/image';

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

    const images = await getImagesByThread(Number(threadId));
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Erreur récupération images:', error);
    return NextResponse.json(
      { error: 'Échec de la récupération' },
      { status: 500 }
    );
  }
} 