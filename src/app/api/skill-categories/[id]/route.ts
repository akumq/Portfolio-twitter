import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// PATCH - Mettre à jour une catégorie
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérification des droits admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    
    const { id } = await params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID de catégorie invalide' }, { status: 400 });
    }
    
    const { name, title, icon, description } = await request.json();
    
    if (!name || !title || !icon) {
      return NextResponse.json({ error: 'Nom, titre et icône sont requis' }, { status: 400 });
    }
    
    const category = await prisma.skillCategory.update({
      where: { id: categoryId },
      data: { name, title, icon, description }
    });
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la catégorie' }, { status: 500 });
  }
}

// DELETE - Supprimer une catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérification des droits admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    
    const { id } = await params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID de catégorie invalide' }, { status: 400 });
    }
    
    // Vérifier si des compétences utilisent cette catégorie
    const skillsCount = await prisma.skill.count({
      where: { categoryId }
    });
    
    if (skillsCount > 0) {
      return NextResponse.json({ 
        error: 'Impossible de supprimer cette catégorie car elle est utilisée par des compétences',
        skillsCount
      }, { status: 400 });
    }
    
    await prisma.skillCategory.delete({
      where: { id: categoryId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression de la catégorie' }, { status: 500 });
  }
} 