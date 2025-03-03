import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Vérification de la configuration
transporter.verify()
  .then(() => {
    console.log('Connexion SMTP établie avec succès');
  })
  .catch((error) => {
    console.error('Erreur lors de la vérification de la configuration SMTP:', error);
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, text } = body;

    // Validation des données
    if (!to || !subject || !text) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    console.log(`Tentative d'envoi d'email à: ${to}`);

    // Envoi de l'email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
    });

    console.log(`Email envoyé avec succès: ${info.messageId}`);

    return NextResponse.json({ success: true, messageId: info.messageId }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}