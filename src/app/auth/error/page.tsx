'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">
          Erreur d&apos;authentification
        </h1>
        <p className="text-gray-600 mb-8">
          {error === 'AccessDenied' 
            ? "Vous n'avez pas l'autorisation d'accéder à cette ressource."
            : "Une erreur s'est produite lors de l'authentification."}
        </p>
        <Link
          href="/"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-500 mb-4">
            Chargement...
          </h1>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
} 