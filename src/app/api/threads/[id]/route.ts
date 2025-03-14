import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const threadId = parseInt(id);
    
    if (isNaN(threadId)) {
      return NextResponse.json(
        { error: 'ID de thread invalide' },
        { status: 400 }
      );
    }

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      select: {
        id: true,
        title: true,
        content: true,
        github: true,
        types: true,
        createdAt: true,
        languages: {
          select: {
            id: true,
            name: true
          }
        },
        medias: {
          where: {
            isThumbnail: false
          },
          select: {
            id: true,
            fileName: true,
            type: true,
            alt: true,
            thumbnail: {
              select: {
                id: true,
                fileName: true
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
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const threadId = parseInt(id);
    
    if (isNaN(threadId)) {
      return NextResponse.json(
        { error: 'ID de thread invalide' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { title, content, github, types, languageIds } = data;

    // Validation des données
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Le titre et le contenu sont requis' },
        { status: 400 }
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
          set: languageIds?.map((id: number) => ({ id })) || []
        }
      },
      select: {
        id: true,
        title: true,
        content: true,
        github: true,
        types: true,
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
            fileName: true,
            type: true,
            alt: true,
            thumbnail: {
              select: {
                id: true,
                fileName: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du thread:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const threadId = parseInt(id);
    
    if (isNaN(threadId)) {
      return NextResponse.json(
        { error: 'ID de thread invalide' },
        { status: 400 }
      );
    }

    await prisma.thread.delete({
      where: { id: threadId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du thread:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 