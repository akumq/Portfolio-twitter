import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(languages);
  } catch (error) {
    console.error('Erreur lors de la récupération des langages:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des langages' },
      { status: 500 }
    );
  }
} 