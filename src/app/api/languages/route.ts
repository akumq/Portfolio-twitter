import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(languages);
  } catch (error) {
    console.error('Erreur lors de la récupération des langages:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérification des droits admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    
    const { name, image } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }
    
    // Vérifier si le langage existe déjà
    const existingLanguage = await prisma.language.findUnique({
      where: { name }
    });
    
    if (existingLanguage) {
      return NextResponse.json({ error: 'Ce langage existe déjà' }, { status: 400 });
    }
    
    const language = await prisma.language.create({
      data: { 
        name,
        image: image || null
      }
    });
    
    return NextResponse.json(language);
  } catch (error) {
    console.error('Erreur lors de la création du langage:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du langage' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    const { name, image } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }

    // Vérifier si le langage existe
    const existingLanguage = await prisma.language.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingLanguage) {
      return NextResponse.json({ error: 'Langage non trouvé' }, { status: 404 });
    }

    // Vérifier si le nouveau nom n'est pas déjà utilisé par un autre langage
    const duplicateName = await prisma.language.findFirst({
      where: {
        name,
        id: { not: parseInt(id) }
      }
    });

    if (duplicateName) {
      return NextResponse.json({ error: 'Ce nom est déjà utilisé' }, { status: 400 });
    }

    const language = await prisma.language.update({
      where: { id: parseInt(id) },
      data: { 
        name,
        image: image || null
      }
    });

    return NextResponse.json(language);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du langage:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du langage' }, { status: 500 });
  }
} 