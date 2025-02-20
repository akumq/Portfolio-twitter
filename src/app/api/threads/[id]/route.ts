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
            isMain: true,
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
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const params = await props.params;
    const data = await request.json();
    const { title, content, github, types, languages } = data;

    // Validation des données
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Le titre et le contenu sont requis' },
        { status: 400 }
      );
    }

    const thread = await prisma.thread.update({
      where: { id: Number(params.id) },
      data: {
        title: title.trim(),
        content: content.trim(),
        github: github?.trim() || null,
        types: types || [],
        languages: {
          set: languages?.map((id: number) => ({ id })) || []
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
            isMain: true,
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
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const params = await props.params;
    await prisma.thread.delete({
      where: { id: Number(params.id) }
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