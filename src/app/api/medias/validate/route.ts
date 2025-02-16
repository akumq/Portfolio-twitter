import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface FileError {
  code: string;
  message: string;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérification du type de fichier
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'video/webm',
      'audio/mpeg', 'audio/wav'
    ] as const;

    if (!allowedTypes.includes(file.type as typeof allowedTypes[number])) {
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

    return NextResponse.json({ success: true });
  } catch (error) {
    const fileError = error as FileError;
    console.error('Erreur lors de la validation du média:', fileError);
    return NextResponse.json(
      { error: 'Erreur lors de la validation du média' },
      { status: 500 }
    );
  }
} 