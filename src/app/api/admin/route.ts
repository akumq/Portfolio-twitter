import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/admin/users
export async function GET() {
  const session = await getServerSession(authOptions) as Session | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email || '' }
  });

  if (!currentUser?.isAdmin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
    }
  });

  return NextResponse.json(users);
}

// PATCH /api/admin/users/:id
export async function PATCH(
  request: Request
) {
  const session = await getServerSession(authOptions) as Session | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email || '' }
  });

  if (!currentUser?.isAdmin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const data = await request.json();
  const url = new URL(request.url);
  const userId = parseInt(url.pathname.split('/').pop() || '');

  if (isNaN(userId)) {
    return NextResponse.json({ error: 'ID utilisateur invalide' }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isAdmin: data.isAdmin },
  });

  return NextResponse.json(updatedUser);
} 