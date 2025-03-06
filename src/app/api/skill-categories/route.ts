import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Récupérer toutes les catégories de compétences
export async function GET() {
  try {
    const categories = await prisma.skillCategory.findMany({
      include: {
        skills: {
          include: {
            languages: true,
            threads: true
          }
        }
      }
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories de compétences:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des catégories' }, { status: 500 });
  }
}

// POST - Créer une nouvelle catégorie de compétence
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérification des droits admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    
    const { name, title, icon, description } = await request.json();
    
    if (!name || !title || !icon) {
      return NextResponse.json({ error: 'Nom, titre et icône sont requis' }, { status: 400 });
    }
    
    const category = await prisma.skillCategory.create({
      data: {
        name,
        title,
        icon,
        description
      }
    });
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la catégorie' }, { status: 500 });
  }
} 