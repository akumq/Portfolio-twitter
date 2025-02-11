import { NextRequest, NextResponse } from 'next/server';
import { storeImage } from '@/services/image';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    
    const formData = await request.formData();
    const files = formData.getAll('files') as Blob[];
    
    const imageIds = [];
    for (const file of files) {
      const image = await storeImage(file, threadId ? Number(threadId) : undefined);
      imageIds.push(image.id);
    }

    return NextResponse.json({ ids: imageIds });
  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json(
      { error: 'Échec de l\'upload' },
      { status: 500 }
    );
  }
} 