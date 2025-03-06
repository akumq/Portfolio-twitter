import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ProjectType } from '@prisma/client';

export async function GET() {
  // Renvoie simplement tous les types de projet de l'énumération ProjectType
  return NextResponse.json(Object.values(ProjectType));
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { name } = await request.json();

    // Vérifier que le nom est une valeur valide de ProjectType
    if (!Object.values(ProjectType).includes(name as ProjectType)) {
      return NextResponse.json(
        { error: 'Type de projet invalide' },
        { status: 400 }
      );
    }

    // Pas besoin de créer quoi que ce soit en base de données, 
    // car nous utilisons simplement l'énumération
    return NextResponse.json({ success: true, name });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du type de projet:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 