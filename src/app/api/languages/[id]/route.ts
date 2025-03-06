import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// PATCH - Mettre à jour un langage
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
    const languageId = parseInt(id);
    if (isNaN(languageId)) {
      return NextResponse.json({ error: 'ID de langage invalide' }, { status: 400 });
    }
    
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }
    
    const language = await prisma.language.update({
      where: { id: languageId },
      data: { name }
    });
    
    return NextResponse.json(language);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du langage:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du langage' }, { status: 500 });
  }
}

// DELETE - Supprimer un langage
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
    const languageId = parseInt(id);
    if (isNaN(languageId)) {
      return NextResponse.json({ error: 'ID de langage invalide' }, { status: 400 });
    }
    
    // Vérifier si des threads utilisent ce langage
    const threadsCount = await prisma.thread.count({
      where: {
        languages: {
          some: {
            id: languageId
          }
        }
      }
    });
    
    if (threadsCount > 0) {
      return NextResponse.json({ 
        error: 'Impossible de supprimer ce langage car il est utilisé par des projets',
        threadsCount
      }, { status: 400 });
    }
    
    await prisma.language.delete({
      where: { id: languageId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du langage:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du langage' }, { status: 500 });
  }
}