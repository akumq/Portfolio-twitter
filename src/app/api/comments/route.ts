import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const json = await request.json();
    const { content, threadId } = json;

    if (!content?.trim() || !threadId) {
      return new NextResponse('Contenu invalide', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse('Utilisateur non trouvé', { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        threadId,
        authorId: user.id
      },
      include: {
        author: true
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
} 