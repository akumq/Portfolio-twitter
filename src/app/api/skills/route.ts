import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Récupérer toutes les compétences
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');
    
    const where = categoryId ? { categoryId: parseInt(categoryId) } : {};
    
    const skills = await prisma.skill.findMany({
      where,
      include: {
        category: true,
        languages: true,
        threads: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Erreur lors de la récupération des compétences:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des compétences' }, { status: 500 });
  }
}

// POST - Créer une nouvelle compétence
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérification des droits admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    
    const { name, description, formation, categoryId, languageIds, threadIds } = await request.json();
    
    if (!name || !description || !formation || !categoryId) {
      return NextResponse.json(
        { error: 'Nom, description, formation et catégorie sont requis' }, 
        { status: 400 }
      );
    }
    
    // Vérifier si la catégorie existe
    const category = await prisma.skillCategory.findUnique({
      where: { id: categoryId }
    });
    
    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
    }
    
    // Créer la compétence avec les relations
    const skill = await prisma.skill.create({
      data: {
        name,
        description,
        formation,
        category: {
          connect: { id: categoryId }
        },
        languages: languageIds && languageIds.length > 0 
          ? { connect: languageIds.map((id: number) => ({ id })) } 
          : undefined,
        threads: threadIds && threadIds.length > 0
          ? { connect: threadIds.map((id: number) => ({ id })) }
          : undefined
      },
      include: {
        category: true,
        languages: true,
        threads: true
      }
    });
    
    return NextResponse.json(skill);
  } catch (error) {
    console.error('Erreur lors de la création de la compétence:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la compétence' }, { status: 500 });
  }
}

// DELETE - Supprimer une compétence
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérification des droits admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    
    await prisma.skill.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la compétence:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression de la compétence' }, { status: 500 });
  }
} 