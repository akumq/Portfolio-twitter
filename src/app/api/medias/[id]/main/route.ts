import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id } = params;
    const media = await prisma.media.findUnique({
      where: { id },
      select: { threadId: true }
    });

    if (!media) {
      return NextResponse.json({ error: 'Média non trouvé' }, { status: 404 });
    }

    // Réinitialiser tous les médias du thread
    if (media.threadId) {
      await prisma.media.updateMany({
        where: { threadId: media.threadId },
        data: { isMain: false }
      });
    }

    // Définir ce média comme principal
    await prisma.media.update({
      where: { id },
      data: { isMain: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du média:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
} 