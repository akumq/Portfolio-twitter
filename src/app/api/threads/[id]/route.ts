import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const thread = await prisma.thread.findUnique({
      where: { id: Number(params.id) },
      include: {
        comments: true,
        languages: true,
        medias: {
          select: {
            id: true,
            url: true,
            type: true,
            alt: true,
            isMain: true,
            thumbnail: {
              select: {
                id: true,
                url: true
              }
            }
          }
        }
      }
    });

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Erreur lors de la récupération du thread:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const threadId = Number(params.id);
    if (isNaN(threadId)) {
      return NextResponse.json(
        { error: 'ID de thread invalide' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { title, content, github, types, languages } = data;

    // Validation des données
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Le titre et le contenu sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si le thread existe
    const existingThread = await prisma.thread.findUnique({
      where: { id: threadId }
    });

    if (!existingThread) {
      return NextResponse.json(
        { error: 'Thread non trouvé' },
        { status: 404 }
      );
    }

    const thread = await prisma.thread.update({
      where: { id: threadId },
      data: {
        title: title.trim(),
        content: content.trim(),
        github: github?.trim() || null,
        types: types || [],
        languages: {
          set: languages?.map((id: number) => ({ id })) || [],
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        github: true,
        types: true,
        imageUrl: true,
        createdAt: true,
        languages: {
          select: {
            id: true,
            name: true
          }
        },
        medias: {
          select: {
            id: true,
            url: true,
            type: true,
            alt: true,
            isMain: true,
            createdAt: true,
            mimeType: true
          },
          orderBy: [
            { isMain: 'desc' },
            { createdAt: 'asc' }
          ]
        }
      }
    });

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du thread:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    const threadId = Number(params.id);
    if (isNaN(threadId)) {
      return NextResponse.json(
        { error: 'ID de thread invalide' },
        { status: 400 }
      );
    }

    // Vérifier si le thread existe
    const existingThread = await prisma.thread.findUnique({
      where: { id: threadId }
    });

    if (!existingThread) {
      return NextResponse.json(
        { error: 'Thread non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer les commentaires
    await prisma.comment.deleteMany({
      where: { threadId }
    });

    // Supprimer les relations avec les langages
    await prisma.thread.update({
      where: { id: threadId },
      data: {
        languages: {
          set: [],
        },
      },
    });

    // Supprimer les médias associés
    await prisma.media.deleteMany({
      where: { threadId }
    });

    // Supprimer le thread
    await prisma.thread.delete({
      where: { id: threadId },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Thread supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du thread:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 