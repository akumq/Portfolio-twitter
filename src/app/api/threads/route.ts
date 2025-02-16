import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { Session } from 'next-auth';

export async function GET() {
  try {
    const threads = await prisma.thread.findMany({
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
            mimeType: true,
            thumbnail: {
              select: {
                id: true,
                url: true
              }
            },
            createdAt: true
          },
          orderBy: [
            { isMain: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Vérifier et logger les médias pour le débogage
    threads.forEach(thread => {
      console.log(`Thread ${thread.id} medias:`, thread.medias);
    });

    return NextResponse.json(threads);
  } catch (error) {
    console.error('Erreur lors de la récupération des threads:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session;

    // Type guard pour vérifier la présence de isAdmin
    if (!session?.user || !('isAdmin' in session.user) || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
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

    const thread = await prisma.thread.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        github: github?.trim() || null,
        types: types || [],
        languages: {
          connect: languages?.map((id: number) => ({ id })) || []
        }
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
          }
        }
      }
    });

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Erreur lors de la création du thread:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 