import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import prisma from '../../../lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, content } = body;
    const session = (await getServerSession(authOptions)) as Session | null;

    // Validation des données
    if (!name || !email || !subject || !content) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Récupérer l'ID de l'utilisateur s'il est connecté
    let authorId = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        authorId = user.id;
      }
    }

    // Création du message dans la base de données
    const message = await prisma.message.create({
      data: {
        name,
        email,
        subject,
        content,
        authorId
      }
    });

    // Envoi d'un email de notification
    try {
      const emailText = `
Nouveau message de contact reçu:
        
De: ${name} (${email})
Sujet: ${subject}
        
Message:
${content}
      `;
      
      await fetch(`${process.env.NEXTAUTH_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: process.env.SMTP_FROM,
          subject: `Nouveau message de contact: ${subject}`,
          text: emailText,
        }),
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de notification:', emailError);
      // On continue même si l'envoi d'email échoue
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du message:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi du message' },
      { status: 500 }
    );
  }
} 