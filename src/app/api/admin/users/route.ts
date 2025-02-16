import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface UpdateUserData {
  id: number;
  isAdmin?: boolean;
  name?: string;
  email?: string;
  image?: string;
}

export async function GET() {
  const session = (await getServerSession(authOptions)) as Session | null;

  if (!session?.user?.isAdmin) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: {
        name: 'asc'
      } as Prisma.UserOrderByWithRelationInput
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = (await getServerSession(authOptions)) as Session | null;
  const data = await request.json() as UpdateUserData;

  if (!session?.user?.isAdmin) {
    return new NextResponse('Non autorisé', { status: 401 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: data.id },
      data: {
        isAdmin: data.isAdmin,
        name: data.name,
        email: data.email,
        image: data.image
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
} 