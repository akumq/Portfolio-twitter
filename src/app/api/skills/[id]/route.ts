import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// PATCH - Mettre à jour une compétence
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
    const skillId = parseInt(id);
    if (isNaN(skillId)) {
      return NextResponse.json({ error: 'ID de compétence invalide' }, { status: 400 });
    }
    
    const { name, categoryId, threadIds, description = '', formation = '' } = await request.json();
    
    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Nom et catégorie sont requis' }, { status: 400 });
    }
    
    // Vérifier que la catégorie existe
    const categoryExists = await prisma.skillCategory.findUnique({
      where: { id: categoryId }
    });
    
    if (!categoryExists) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 400 });
    }
    
    const skill = await prisma.skill.update({
      where: { id: skillId },
      data: { 
        name,
        description,
        formation,
        categoryId,
        // Mettre à jour les associations avec les threads si fournis
        ...(threadIds && {
          threads: {
            set: [], // Supprimer les associations existantes
            connect: threadIds.map((threadId: number) => ({ id: threadId })) // Créer les nouvelles associations
          }
        })
      },
      include: {
        threads: true,
        category: true
      }
    });
    
    return NextResponse.json(skill);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la compétence:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la compétence' }, { status: 500 });
  }
}

// DELETE - Supprimer une compétence
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
    const skillId = parseInt(id);
    if (isNaN(skillId)) {
      return NextResponse.json({ error: 'ID de compétence invalide' }, { status: 400 });
    }
    
    // Supprimer les associations avec les threads
    await prisma.skill.update({
      where: { id: skillId },
      data: {
        threads: {
          set: [] // Supprimer toutes les associations
        }
      }
    });
    
    // Supprimer la compétence
    await prisma.skill.delete({
      where: { id: skillId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la compétence:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression de la compétence' }, { status: 500 });
  }
}