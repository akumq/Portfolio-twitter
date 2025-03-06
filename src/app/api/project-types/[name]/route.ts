import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ProjectType } from '@prisma/client';

export async function DELETE(
  request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    // Vérifier que le nom est une valeur valide de ProjectType
    if (!Object.values(ProjectType).includes(decodedName as ProjectType)) {
      return NextResponse.json(
        { error: 'Type de projet invalide' },
        { status: 400 }
      );
    }

    // Pas besoin de supprimer quoi que ce soit en base de données, 
    // car nous utilisons simplement l'énumération
    return NextResponse.json({ success: true, name: decodedName });
  } catch (error) {
    console.error('Erreur lors de la suppression du type de projet:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 